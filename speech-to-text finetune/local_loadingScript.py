import os
import datasets
from datasets import DatasetInfo, GeneratorBasedBuilder, Split, SplitGenerator, BuilderConfig, Features, Value, Array2D, Sequence

class AudioTranscriptDataset(datasets.GeneratorBasedBuilder):
    """Dataset for loading and processing audio and transcript pairs."""

    VERSION = datasets.Version('1.0.0')

    BUILDER_CONFIGS = [
        datasets.BuilderConfig(name='all', version=VERSION, description='NSC Part 3 dataset with audio and transcripts.'),
    ]

    def _info(self):
        # return dataset information
        features = Features({
            'audio_path': Value('string'),  # path to the audio file
            'transcript_path': Value('string'),  # path to the transcript
            'input_features': Array2D(dtype="float32", shape=(None, None)), # log-Mel spectogram represented as 2D tensor for input features
            'labels': Sequence(Value('int32')), # sequence of integers for the tokenized labels
        })
        return DatasetInfo(
            description='NSC Part 3 dataset consisting of audio and transcript chunks.',
            features=features,
            homepage='',
            license='',
        )

    def _split_generators(self, dl_manager):
        # instead of downloading, we will use local directories
        audio_dir = 'dataset/audio_segments'
        transcript_dir = 'dataset/transcript_segments'
        
        # list audio and transcript files
        audio_files = sorted(os.listdir(audio_dir))
        transcript_files = sorted(os.listdir(transcript_dir))

        # check if the number of audio files matches the number of transcript files
        if len(audio_files) != len(transcript_files):
            raise ValueError(f'Mismatch between number of audio files ({len(audio_files)}) and transcript files ({len(transcript_files)})')

        # split the data (assuming 80% train, 10% validation, 10% test)
        split_idx_train = int(0.8 * len(audio_files))
        split_idx_val = int(0.9 * len(audio_files))

        train_audio_files = audio_files[:split_idx_train]
        val_audio_files = audio_files[split_idx_train:split_idx_val]
        test_audio_files = audio_files[split_idx_val:]

        train_transcript_files = transcript_files[:split_idx_train]
        val_transcript_files = transcript_files[split_idx_train:split_idx_val]
        test_transcript_files = transcript_files[split_idx_val:]

        # define SplitGenerators for train, validation, and test sets
        return [
            datasets.SplitGenerator(
                name='train',
                gen_kwargs={'audio_files': train_audio_files, 'transcript_files': train_transcript_files},
            ),
            datasets.SplitGenerator(
                name='validation',
                gen_kwargs={'audio_files': val_audio_files, 'transcript_files': val_transcript_files},
            ),
            datasets.SplitGenerator(
                name='test',
                gen_kwargs={'audio_files': test_audio_files, 'transcript_files': test_transcript_files},
            ),
        ]

    def _generate_examples(self, audio_files, transcript_files):
        id_ = 0
        
        # iterate over the audio and transcript files and yield examples
        for audio_file, transcript_file in zip(audio_files, transcript_files):
            audio_path = os.path.join('dataset/audio_segments', audio_file)
            transcript_path = os.path.join('dataset/transcript_segments', transcript_file)

            # yield the audio file path and the corresponding transcript
            yield id_, {
                'audio_path': audio_path,
                'transcript_path': transcript_path,
            }
            
            id_ += 1
