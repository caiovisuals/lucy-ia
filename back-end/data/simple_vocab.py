from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression

from dataset import data
from utils.preprocessor import normalize

phrases = [normalize(text) for text, intent in data]
labels = [intent for text, intent in data]

vectorizer = CountVectorizer()
X = vectorizer.fit_transform(phrases)

model = LogisticRegression()
model.fit(X, labels)