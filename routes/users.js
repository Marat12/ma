var express = require("express");
var router  = express.Router();
var passport = require("passport");
var bcrypt = require("bcryptjs");


// Get User Model

  var User = require("../models/user");

//GET / 

router.get("/register", function(req, res){
    res.render('register', {
        title: 'Регистрация'
    });
});

//POST Register / 

router.post("/register", function(req, res){
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    
    req.checkBody('name', 'Требуется Имя').notEmpty();
    req.checkBody('email', 'Требуется Email').isEmail();
    req.checkBody('username', 'Требуется Имя').notEmpty();
    req.checkBody('password', 'Требуется Пароль').notEmpty();
    req.checkBody('password2', 'Пароль не совпадает').equals(password);
    
    var errors = req.validationErrors();
    
    if(errors) {
        res.render('register', {
            errors:errors,
            user: null,
            title: 'Register'
        });
    } else {
        User.findOne({username: username}, function(err, user){
            if(err) console.log(err);
            if(user) {
                req.flash('danger', 'Такое имя уже существует!');
                res.redirect('/users/register');
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 1
                });
                
                    bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash (user.password, salt, function(err, hash) {
                        if(err) console.log(err);
                        user.password = hash;
                        user.save(function(err) {
                            if(err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'Вы зарегестрированы!');
                                res.redirect('/users/login');                                
                            }
                        });
                    });
                });
            }
        });
    }
});

//GET login / 

router.get("/login", function(req, res){
    if(res.locals.user) res.redirect('/');
    
    res.render('login', {
        title: 'Войти'
    });
});

//POST login / 

router.post("/login", function(req, res, next){
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    }) (req, res, next);
});

//GET logout / 

router.get("/logout", function(req, res){
     req.logout();
     req.flash('success', 'Вы вышли');
     res.redirect('/users/login');
});

module.exports = router;