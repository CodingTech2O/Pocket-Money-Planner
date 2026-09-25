from flask_wtf import FlaskForm
from wtforms import StringField,IntegerField
from wtforms.validators import DataRequired, EqualTo


class LoginForm(FlaskForm):
    username = StringField("Enter Username: ", validators=[DataRequired()])
    password = StringField("Enter Password: ", validators=[DataRequired()])

class SignUpForm(FlaskForm):
    username = StringField("Enter Username: ",validators=[DataRequired()])
    password = StringField("Enter Password: ", validators=[DataRequired()])
    confirm_password = StringField("Enter Password: ", validators=[DataRequired,EqualTo("password","Passwords don't match")])

class MainForm(FlaskForm):
    monthly_pocket_money = IntegerField("Enter Monthly Pocket Money: ",validators=[DataRequired()])
    yearly_save_goal = IntegerField("How much do you want to save in an year: ", validators=[DataRequired()])
