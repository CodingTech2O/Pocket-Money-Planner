from flask import Flask, render_template, redirect, url_for, session, flash
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from forms import LoginForm, SignUpForm, MainForm
import json

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")

os.makedirs("data", exist_ok=True)


@app.route("/")
def index():
    user = session.get("USER")
    if user:
        details_path = os.path.join("data", user, "details.json")
        if not os.path.exists(details_path):
            return redirect(url_for("details", username=user))
        with open(details_path, "r") as f:
            data = json.load(f)
        return render_template("index.html", data=data, user=user)
    return render_template("index.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        if os.path.exists(f"data/{form.username.data}"):
            with open(f"data/{form.username.data}/credentials.json", "r") as f:
                data = json.load(f)
            if check_password_hash(data['password'], form.password.data):
                session['USER'] = form.username.data
                return redirect(url_for("index"))
        flash("Invalid username or password.", "error")
    return render_template("login.html", form=form)


@app.route("/sign_up", methods=["GET", "POST"])
def sign_up():
    form = SignUpForm()
    if form.validate_on_submit():
        if os.path.exists(f"data/{form.username.data}"):
            flash("That username is already taken.", "error")
            return render_template("sign_up.html", form=form)
        os.mkdir(f"data/{form.username.data}")
        with open(f"data/{form.username.data}/credentials.json", "w") as f:
            json.dump({
                "username": form.username.data,
                "password": generate_password_hash(form.password.data)
            }, f)
        session['USER'] = form.username.data
        return redirect(url_for("details", username=form.username.data))
    return render_template("sign_up.html", form=form)


@app.route("/details/<username>", methods=["GET", "POST"])
def details(username):
    if session.get("USER") != username:
        return redirect(url_for("login"))
    form = MainForm()
    if form.validate_on_submit():
        with open(f"data/{username}/details.json", "w") as f:
            json.dump({
                "monthly-inc": form.monthly_pocket_money.data,
                "yearly-goal": form.yearly_save_goal.data,
                "monthly-spend": ((form.monthly_pocket_money.data*12) - form.yearly_save_goal.data)/12,
                "weekly-spend": ((form.monthly_pocket_money.data*12) - form.yearly_save_goal.data)/52,
                "monthly-goal": form.yearly_save_goal.data/12,
                "weekly-goal": form.yearly_save_goal.data/52
            }, f)
        flash("Your plan is ready.", "success")
        return redirect(url_for("index"))
    return render_template("details.html", form=form, user=username)


@app.route("/logout")
def logout():
    session.pop("USER", None)
    flash("You've been logged out.", "success")
    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True)
