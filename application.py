from flask import Flask, render_template, jsonify, request, redirect
from random import randint
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///scores.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class scores(db.Model):
    score_id = db.Column("id", db.Integer, primary_key=True)
    name = db.Column("name", db.String(20))
    score = db.Column("score", db.Integer)

    def __init__(self, name, score):
        self.name = name
        self.score = score


# auto-reload
app.config["TEMPLATES_AUTO_RELOAD"] = True

# requests aren't cashed
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


points = 0


@app.route("/", methods=["GET","POST"])
def index():
    if request.method == "GET":
        #global points
        #points = 0
        return render_template("index.html")
    else:
        # create new random numbers and return JSON object
        order = []
        request_count = int(request.form.get("count"))
        if request_count == 3:
            points = 0
        for i in range(request_count):
            while True:
                ran = randint(0,8)
                if len(order) == 0 or ran != order[len(order)-1]:
                    order.append(ran)
                    break
        return jsonify(order)
    

@app.route("/leaderboard", methods=["GET","POST"])
def leaderboard():
    if request.method == "GET":
        page = request.args.get("page")
        if not page:
            page = 1
        players = scores.query.order_by(scores.score.desc()).limit(11).offset((int(page) - 1) * 10).all()
        for player in players:
            player.rank = scores.query.filter(scores.score > player.score).count() + 1
        return render_template("leaderboard.html", scores=players, page=int(page))
    else:
        # scr = scores(request.form.get("name")[:20], score)
        scr = scores(request.form.get("name")[:20], request.form.get("score"))
        db.session.add(scr)
        db.session.commit()
        return redirect("/leaderboard")


@app.route("/search", methods=['GET'])
def search():
    return render_template("search.html")


@app.route("/query", methods=['GET'])
def query():
    q = request.args.get("q")
    if len(q) >= 1:
        players = scores.query.filter(scores.name.like(f'{q}%')).order_by(scores.score.desc()).all()
    else:
        players = []
    for player in players:
        player.rank = scores.query.filter(scores.score > player.score).count() + 1
    return render_template("query.html", scores=players)


@app.route('/how-to-play', methods = ['GET'])
def howtoplay():
    return render_template("howtoplay.html")


if __name__ == "__main__":
    db.create_all()
    app.run()