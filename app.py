from flask import Flask, render_template,redirect,url_for,session
import os
from werkzeug.security import generate_password_hash, check_password_hash
from forms import LoginForm, SignUpForm, MainForm

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")



@app.route("/")
def index():
    return render_template("index.html")

@app.route("/login")
def login():
    form = LoginForm()
    if form.validate_on_submit():
        
    

if __name__ == "__main__":
    app.run(debug=True)