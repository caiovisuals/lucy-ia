import pickle
from sklearn.naive_bayes import MultinomialNB
from data.dataset import data
from utils.vectorizer import vectorizer

texts = [d[0] for d in data]
labels = [d[1] for d in data]

X = vectorizer.fit_transform(texts)

model = MultinomialNB()
model.fit(X, labels)

# salvar modelo
with open("model/model.pkl", "wb") as f:
    pickle.dump(model, f)

# salvar vectorizer
with open("model/vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)