import os

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.future import select

# declare base for models
Base = declarative_base()

# database connection string (environment variables for sensitive data)
DATABASE_URL = f"mysql+aiomysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@mysql:3306/db"

# create async engine
engine = create_async_engine(DATABASE_URL, echo=True, future=True)

# create async sessionmaker
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# function to create tables in the database
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# CRUD operations
async def db_create(model_instance):
    async with async_session() as db:
        try:
            db.add(model_instance)
            await db.commit()
            await db.refresh(model_instance)
            return model_instance
        except Exception as e:
            print(f"Error during db_create: {e}")
            return None
    
async def db_get(model):
    async with async_session() as db:
        try:
            result = await db.execute(model)
            return result.scalars().all()
        except Exception as e:
            print(f"Error during db_get: {e}")
            return None
    
async def db_get_by_id(model, model_id):
    async with async_session() as db:
        try:
            result = await db.execute(select(model).where(model.id == model_id))
            return result.scalar_one_or_none() 
        except Exception as e:
            print(f"Error during db_get_id: {e}")
            return None
        
async def db_get_by_attribute(model, attribute, value):
    async with async_session() as db:
        try:
            result = await db.execute(select(model).where(getattr(model, attribute) == value))
            return result.scalars().all()
        except Exception as e:
            print(f"Error during db_get_attribute: {e}")
            return None
    
async def db_update(model, model_id, update_data):
    async with async_session() as db:
        try:
            obj = await db.execute(select(model).where(model.id == model_id))
            existing_obj = obj.scalar_one_or_none()

            if existing_obj:
                for key, value in update_data.items():
                    setattr(existing_obj, key, value)

                await db.commit()
                await db.refresh(existing_obj)
                return existing_obj
            return None
        except Exception as e:
            print(f"Error during db_update: {e}")
            return None
    
async def db_delete(model, model_id):
    async with async_session() as db:
        try:
            obj = await db.execute(select(model).where(model.id == model_id))
            existing_obj = obj.scalar_one_or_none()

            if existing_obj:
                await db.delete(existing_obj)
                await db.commit()
                return existing_obj
            return None
        except Exception as e:
            print(f"Error during db_delete: {e}")
            return None