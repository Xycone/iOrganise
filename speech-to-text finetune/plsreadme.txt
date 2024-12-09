The dataset and the model checkpoints are excluded from the zip file as it is too large in size. Do note that the data preprocessing steps used in the notebook requires the data be arranged in the same folder structure and with the same folder names. 

The dataset can be accessed on dropbox after requesting access to the dataset here. The invite to the dataset on dropbox will be sent via email after completing the form:
https://docs.google.com/forms/d/e/1FAIpQLSd3k8wFF4GQP4yo_lDAXKjCltfYk-dE-yYpegTnCB20kr7log/viewform

I would be specifically using the 'Audio Same CloseMic', 'Audio Seperate StandingMic', 'Scripts Same' and 'Scripts Seperate' folders inside part 3 of the speech corpus arranged in the following folder format.
dataset
│
├── audio
│   ├── 3000-1.wav                              # Audio Same CloseMic
│   ├── 3000-2.wav                              # Audio Same CloseMic
│   ├── conf_2500_2500_00862025.wav             # Audio Seperate StandingMic
│   └── conf_2500_2500_00862177.wav             # Audio Seperate StandingMic
│
└── transcripts
    ├── 3000-1.TextGrid                         # Scripts Same
    ├── 3000-2.TextGrid                         # Scripts Same
    ├── conf_2500_2500_00862025.TextGrid        # Scripts Seperate
    └── conf_2500_2500_00862177.TextGrid        # Scripts Seperate

The best checkpoint that I selected during the training process can be found on my huggingface repo here: https://huggingface.co/Xycone/whisper-small-singapore-finetune