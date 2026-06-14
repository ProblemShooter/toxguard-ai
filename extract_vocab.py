import os
import pandas as pd
import tensorflow as tf
from tensorflow.keras.layers import TextVectorization
import pickle
import json

print("Reading CSV...")
df = pd.read_csv(os.path.join('jigsaw-toxic-comment-classification-challenge', 'train.csv', 'train.csv'))
X = df['comment_text']

print("Adapting vectorizer...")
MAX_FEATURES = 200000
vectorizer = TextVectorization(max_tokens=MAX_FEATURES,
                               output_sequence_length=1800,
                               output_mode='int')
vectorizer.adapt(X.values)

print("Extracting vocabulary...")
vocab = vectorizer.get_vocabulary()

print("Saving vocabulary to pickle...")
with open('project/backend/model/vocab.pkl', 'wb') as f:
    pickle.dump(vocab, f)

print("Vocabulary saved successfully. Size:", len(vocab))
