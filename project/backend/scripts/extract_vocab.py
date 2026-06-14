import os
import pandas as pd
import pickle
from tensorflow.keras.layers import TextVectorization

def extract_and_save_vocab():
    print("Reading training data...")
    # Adjust path if necessary based on where it's run from
    csv_path = os.path.join('..', 'jigsaw-toxic-comment-classification-challenge', 'train.csv', 'train.csv')
    if not os.path.exists(csv_path):
        csv_path = 'train.csv' # Fallback
    
    df = pd.read_csv(csv_path)
    X = df['comment_text']

    print("Adapting vectorizer...")
    MAX_FEATURES = 200000
    vectorizer = TextVectorization(max_tokens=MAX_FEATURES,
                                   output_sequence_length=1800,
                                   output_mode='int')
    vectorizer.adapt(X.values)

    print("Extracting vocabulary...")
    vocab = vectorizer.get_vocabulary()

    vocab_path = os.path.join('backend', 'model', 'vocab.pkl')
    os.makedirs(os.path.dirname(vocab_path), exist_ok=True)
    with open(vocab_path, 'wb') as f:
        pickle.dump(vocab, f)

    print(f"Vocabulary saved successfully to {vocab_path}. Size: {len(vocab)}")

if __name__ == "__main__":
    extract_and_save_vocab()
