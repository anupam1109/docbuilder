var express			 		= require('express'),
	mongoose		 		= require('mongoose'),
	bodyParser		 		= require('body-parser'),
	passport		 		= require('passport'),
	LocalStrategy	 		= require('passport-local'),
	passportLocalMongoose	= require('passport-local-mongoose'),
	expressSession 			= require('express-session'),
	User					= require('./models/user');


mongoose.connect("mongodb://localhost/Document_help", { useNewUrlParser: true });

var app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true}));

app.use(expressSession({
	secret : "Anything",
	resave : false,
	saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}

// Routes

app.get("/", function(req, res){
	res.render("index",{
		title: "DocBuilder"
	});
});

app.get("/signup", function(req, res){
	res.render("signup.ejs");
});

app.post("/signup", function(req, res){
	var password = req.body.password;

	var newUser = new User({
		username : req.body.username, 
		email	 : req.body.mail_id,
		name 	 : req.body.name
	});

	User.register(newUser, password, function(err, user){
		if(err) {
			console.log("Something went wrong!");
			console.log(err);
			return res.redirect("/home");
		}
		passport.authenticate('local')(req, res, function(){
			res.render("private.ejs");
		});
	});
});

app.get("/login", function(req, res){
	res.render("login.ejs");
});

app.post("/login", passport.authenticate('local', {
	successRedirect : "/private",
	failureRedirect : "/login"
}), function(req, res){});

app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});

app.get("/private", isLoggedIn, function(req, res){
	res.render("private.ejs")
});

// Listening to the server

app.listen(process.env.PORT || 3000, function(){
    console.log(`Server is listening on 3000`);
});
