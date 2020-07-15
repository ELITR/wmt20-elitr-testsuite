export LC_ALL=C.UTF-8
export LANG=C.UTF-8
export FLASK_ENV=development
export FLASK_APP=main.py

PREVWD=`pwd`
TARGETWD=`realpath "$0" | xargs dirname`

cd "$TARGETWD"
python3 -m flask run --port 8001 --host 0.0.0.0 --without-threads
cd $PREVWD
