from flask import Flask, render_template,redirect,url_for,session
import os
from werkzeug.security import generate_password_hash, check_password_hash
from forms import LoginForm, SignUpForm, MainForm
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")

session['USER'] = None

@app.route("/")
def index():
    if session["USER"]:
        base = f"data/{session['USER']}"
        with open(os.path.join(base,"details.json"),"w") as f:
            data = json.load(f)
        return render_template("index.html",data = data)
    return render_template("index.html")

@app.route("/login")
def login():
    form = LoginForm()
    if form.validate_on_submit():

        if os.path.exists(f"data/{form.username.data}"):
            with open(f"data/{form.username.data}/credentials.json","r") as f:
                data = json.load(f)
            if check_password_hash(data['password'],form.password.data):
                session['USER'] = form.username.data
                return redirect(url_for("index"))
    return render_template("login.html", form=form)

@app.route("/sign_up")
def sign_up():
    form = SignUpForm()
    if form.validate_on_submit():
        os.mkdir(f"data/{form.username.data}")
        with open(f"data/{form.username.data}/credentials.json","w") as f:
            json.dump({
                "username":form.username.data,
                "password":generate_password_hash(form.password.data)
            },f)
        return redirect(url_for("details",username = form.username.data))
    return render_template("sign_up.html",form=form)

@app.route("/details/<username>")
def details(username):
    form = MainForm()
    if form.validate_on_submit():
        with open(f"data/{username}/details.json","w") as f:
            json.dump({
                "monthly-inc": form.monthly_pocket_money.data,
                "yearly-goal": form.yearly_save_goal.data,
                "monthly-spend":((form.monthly_pocket_money.data*12) - form.yearly_save_goal.data)/12,
                "weekly-spend": ((form.monthly_pocket_money.data*12) - form.yearly_save_goal.data)/52,
                "monthly-goal": form.yearly_save_goal.data/12,
                "weekly-goal": form.yearly_save_goal.data/52
            },f)
        session['USER'] = username
        return redirect(url_for("index"))
    return render_template("details.html",form = form)
    


if __name__ == "__main__":
    app.run(debug=True)