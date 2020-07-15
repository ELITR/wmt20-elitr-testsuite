export LC_ALL=C.UTF-8
export LANG=C.UTF-8
export FLASK_ENV=production
export FLASK_APP=main.py

PREVWD=`pwd`
TARGETWD=`realpath "$0" | xargs dirname`

cd "$TARGETWD"
nohup python3 -m flask run --port 80 --host 0.0.0.0 --without-threads &
cd $PREVWD
