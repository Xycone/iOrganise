# iOrganise
This application is designed to help students streamline the process of organising study materials and encourages better study habits.

## Key Features 🛠️
- **Audio Processing**: Generate text transcripts for uploaded audio and video files.
- **Image Processing**: Convert uploaded hand written notes into digital text.
- **Subject Classification**: Automatic classification of uploaded study material by subject.
- **Content Summary**: Produce summaries of uploaded study materials using LLMs.

## Tech Stack 📦
- **Backend:**
  - Python
  - FastAPI
  - Uvicorn
- **Frontend:**
  - Javascript
  - React
  - Material-UI (MUI)

## Hardware requirements 💻
For the best experience, ensure that your system meets or exceeds the recommended hardware requirements:
### Recommended requirements
- **CPU:** 8 or more x86 vCPUs (with AVX, Intel "Sandy Bridge" or later / AMD "Bulldozer" or later)
- **RAM:** 16 GB or more
- **Storage:** 70 GB of available disk space
- **GPU:** Dedicated graphics card with at least 16 GB VRAM

## Docker Setup 🐋
Make sure hardware virtualisation is enabled in the BIOS
### Installation
1. Run Windows Terminal as administrator.
2. Enter the following commands into the CLI:
    ```bash
    wsl --install
    ```
3. Install Ubuntu from the Microsoft Store and open it.
4. Follow the instructions to create a new UNIX user account.
5. Download the Docker Desktop Installer from the following link: [Docker Desktop Installer](https://docs.docker.com/desktop/install/windows-install/)
6. Run the installer and open the app after installation is complete.
7. Select Ubuntu in "Settings > Resources > WSL Integration."
8. Make sure to apply changes and restart Docker Desktop.
### Additional installation for GPU support
9. Open the Ubuntu app.
10. Follow the instructions to install the NVIDIA Container Toolkit using Apt:
    ```bash
    curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
    && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
    ```

    ```bash
    sudo apt-get update
    ```

    ```bash
    sudo apt-get install -y nvidia-container-toolkit
    ```
11. Verify the installation:
    ```bash
    nvidia-ctk --version
    ```
12. Configure Docker to use the NVIDIA Container Runtime:
    ```bash
    sudo mkdir -p /etc/docker
    ```

    ```bash
    sudo tee /etc/docker/daemon.json <<EOF
    {
      "runtimes": {
        "nvidia": {
          "path": "nvidia-container-runtime",
          "runtimeArgs": []
        }
      }
    }
    EOF
    ```
13. Make sure Docker Desktop is up to date and reboot Windows.

## Running the application ▶️
Follow the instructions to start iOrganiseUI and iOrganiseAPI:
### Starting iOrganiseUI frontend:
1. Make sure NodeJS is properly installed
2. Open the terminal or command prompt.
3. Navigate to the iOrganiseUI directory:
4. Install the necessary dependencies:
    ```bash
    npm install
    ```
5. Run the project:
    ```bash
    npm start
    ```
### Creating the Docker CPU Image
1. Start Docker Desktop.
2. Open the Windows Terminal.
3. Run the command. Replace `<folder_path>` with the path to the project directory containing the Dockerfile:
    ```bash
    docker build -f Dockerfile.cpu -t iorganise-api-cpu-img <folder_path>
    ```
### Creating the Docker GPU Image
1. Start Docker Desktop.
2. Open the Windows Terminal.
3. Ensure that your CUDA version is >= 12.6
4. Run the command. Replace `<folder_path>` with the path to the project directory containing the Dockerfile:
    ```bash
    docker build -f Dockerfile.gpu -t iorganise-api-gpu-img <folder_path>
    ```
### Starting a regular container
Open the Windows Terminal and run the following commands:
```bash
docker create -p 8000:8000 --name iorganise-api-cpu iorganise-api-cpu-img
```

```bash
docker start iorganise-api-cpu
```
### Starting a GPU accelerated container
Open Ubuntu and run the following commands:
```bash
docker create --gpus all -p 8000:8000 --name iorganise-api-gpu iorganise-api-gpu-img
```

```bash
docker start iorganise-api-gpu
```

## TODO 📋
- [x] Revamp file processing workflow to handle transcription content summarisation in batches.
- [x] Add functionality to enable or disable content summarisation.
- [ ] Update the layout, styling, and organization of the transcribe file page to enhance readability and user experience.

## Acknowledgements 🙏
This application was created as part of a Year 3 project module in our Diploma in Information Technology (DIT) program at Nanyang Polytechnic.

- Utilizing the advanced audio alignment capabilities of [WhisperX](https://github.com/m-bain/whisperX), we deployed our fine-tuned Whisper model after converting it to the required format.

- Additionally, we also incorporated the (insert library/repository name) 

- Last but not least, we made use of the following quantised models to perform content summarisation
  - Mistral 7B Instruct model, provided by [TheBloke on Hugging Face](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF)
  - Llama 8B Instruct model, provided by [QuantFactory on Hugging Face](https://huggingface.co/QuantFactory/Meta-Llama-3.1-8B-Instruct-GGUF)
  - Mistral Small Instruct 22B model, provided by [bartowski on Hugging Face](https://huggingface.co/bartowski/Mistral-Small-Instruct-2409-GGUF)

### Credits for other libraries and dependencies
- **`llama-cpp-python`**: Python bindings for llama.cpp. [Source](https://github.com/abetlen/llama-cpp-python). Licensed under the MIT License.
- **`aiofiles`**: Asynchronous file handling. [Source](https://github.com/Tinche/aiofiles). Licensed under the Apache2 License.
- **`fastapi`**: API framework. [Source](https://github.com/tiangolo/fastapi). Licensed under the MIT License.
- **`langchain-community`**: Language model applications. [Source](https://github.com/langchain-ai/langchain). Licensed under the MIT License.
- **`pydub`**: Audio processing. [Source](https://github.com/jiaaro/pydub). Licensed under the MIT License.
- **`python-multipart`**: Multipart form handling. [Source](https://github.com/Kludex/python-multipart). Licensed under the Apache2 License.
- **`uvicorn`**: ASGI server for Python web apps. [Source](https://github.com/encode/uvicorn). Licensed under the BSD 3-Clause License.

The successful implementation of this project owes much to the contributions of several open-source models and repositories.
We extend our sincere thanks to the developers and contributors of these invaluable tools for their contributions to the field.
