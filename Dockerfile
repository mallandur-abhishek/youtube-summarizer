FROM python:3.8.1-buster
WORKDIR /usr/src/app
COPY requirements.txt requirements.txt

RUN python3 -m pip install --upgrade pip setuptools wheel
RUN pip3 install -r requirements.txt
COPY main.py main.py
ENTRYPOINT ["python"]

CMD ["main.py"]