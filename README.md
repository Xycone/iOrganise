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
- **Storage:** 80 GB of available disk space
- **GPU:** Nvidia 20/30/40 series graphics card with at least 16 GB VRAM

## Docker Setup 🐋
Make sure hardware virtualisation is enabled in the BIOS.
### Installation
1. Run Windows Terminal as administrator.
2. Enter the following commands into the CLI:
    ```bash
    wsl --install
    ```
3. Check if Ubuntu is installed in the Microsoft store and open it.
4. Follow the instructions to create a new UNIX user account.
5. Download the Docker Desktop Installer from the following link: [Docker Desktop Installer](https://docs.docker.com/desktop/install/windows-install/).
6. Run the installer and open the app after installation is complete.
7. Select Ubuntu in "Settings > Resources > WSL Integration."
8. Make sure to apply changes and restart Docker Desktop.
### Additional installation for GPU support
9. Open Ubuntu.
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
13. Make sure Docker Desktop is up to date and restart.

## Running the application ▶️
Follow the instructions to start iOrganiseUI and iOrganiseAPI:
### Starting iOrganiseUI frontend
1. Make sure NodeJS is properly installed.
2. Open the terminal or command prompt.
3. Navigate to the iOrganiseUI directory.
4. Install the necessary dependencies:
    ```bash
    npm install
    ```
5. Run the project:
    ```bash
    npm start
    ```
### Starting iOrganiseAPI backend
1. Start Docker Desktop.
2. Open the Windows Terminal.
3. Navigate to the directory containing the docker-compose.yml file.
4. If running the backend with a GPU, make sure CUDA >= 12.3 by running the following command in Ubuntu:
    ```bash
    nvidia-smi
    ```
5. Adjust the environmental variables within the .env file as needed. It will attempt to build the Dockerfile.gpu using nvidia runtime if left unmodified.
6. Run the command:
    ```bash
    docker-compose up --build
    ```

## TODO 📋
- [x] Revamp file processing workflow to handle transcription content summarisation in batches.
- [x] Add functionality to enable or disable content summarisation.
- [ ] Update the layout, styling, and organization of the transcribe file page to enhance readability and user experience.

## Acknowledgements 🙏
This application was created as part of a Year 3 project module in our Diploma in Information Technology (DIT) program at Nanyang Polytechnic.

- Utilising the faster transcription capabilities made possible by [faster-whisper](https://github.com/SYSTRAN/faster-whisper), we deployed our fine-tuned Whisper model after converting it to the required format.

- Last but not least, we made use of the following quantised models to perform content summarisation
  - Mistral 7B Instruct model, provided by [TheBloke on Hugging Face](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF)
  - Deepseek R1 Qwen 14B Distill model, provided by [bartowski on Hugging Face](https://huggingface.co/bartowski/DeepSeek-R1-Distill-Qwen-14B-GGUF)

### Credits for other libraries and dependencies
- **`llama-cpp-python`**: Python bindings for llama.cpp. [Source](https://github.com/abetlen/llama-cpp-python). Licensed under the MIT License.
- **`aiofiles`**: Asynchronous file handling. [Source](https://github.com/Tinche/aiofiles). Licensed under the Apache2 License.
- **`fastapi`**: API framework. [Source](https://github.com/tiangolo/fastapi). Licensed under the MIT License.
- **`pydub`**: Audio processing. [Source](https://github.com/jiaaro/pydub). Licensed under the MIT License.
- **`python-multipart`**: Multipart form handling. [Source](https://github.com/Kludex/python-multipart). Licensed under the Apache2 License.
- **`uvicorn`**: ASGI server for Python web apps. [Source](https://github.com/encode/uvicorn). Licensed under the BSD 3-Clause License.

The successful implementation of this project owes much to the contributions of several open-source models and repositories.
We extend our sincere thanks to the developers and contributors of these invaluable tools for their contributions to the field.
