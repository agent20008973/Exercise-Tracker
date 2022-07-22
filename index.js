require('dotenv').config();

const express = require('express')
const app = express()
const cors = require('cors')
const {User, Excercise} = require('./connection')

app.use(cors())
app.use(express.static('public'))
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.post('/api/users', (req,res)=>{
  User.findOne({username: req.body.username}, (err, data)=>{
    if (data){
      return res.status(400).send("User with this username exists")
    }
    else{
      var new_user = new User({username: req.body.username})
      new_user.save(function(err, data) {
        if (err) return console.error(err);
        res.json({username: data.username, _id: data._id})
      });
    }
  })

})
app.get('/api/users', (req,res)=>{
  User.find( function (err, users) {
    if (err) return console.log(err);
    res.status(200).send(users)
  }).select({__v: 0});
  
})
app.get('/api/users/:id/logs', (req,res)=>{
  User.findById(req.params.id, (err,person)=>{
    if (person){
    let findConditions = {id: person.id };

    let limit;
    if ((req.query.from !== undefined && req.query.from !== '') || (req.query.to !== undefined && req.query.to !== '')) {
      findConditions.date = {};
      
      if (req.query.from !== undefined && req.query.from !== '') {
        findConditions.date.$gte = new Date(req.query.from);
      }
      
      if (req.query.to !== undefined && req.query.to !== '') {
        findConditions.date.$lte = new Date(req.query.to);
      }
    }     
    if (req.query.limit){
        limit = Number(req.query.limit)
            }
            
    Excercise.find(findConditions).select ({__v:0,id:0,_id:0}).limit(limit).exec( (err,excerise)=>{
            res.json({"_id":person.id, "username": person.username,"count": Object.keys(excerise).length, "log":excerise.map(function(e) { return { description: e.description, duration: e.duration, date: e.date.toDateString() }; })})
          })
      }
    else{
      res.status(400).send("Invalid id")
    }
  })

})
app.post('/api/users/:id/exercises', (req,res)=>{
  const id = req.params.id
  if (id){
    User.findById(id, (err, person) => {
      if(err) return res.send(err)
      if (!req.body.description || !req.body.duration){
        return res.status(400).send("Error")
      }
      else{
        let date;
        if (!req.body.date){
            date = new Date()
        }
        else{
          date = new Date(req.body.date)
        }
        if (person){
          var new_excercise = new Excercise({description: req.body.description, duration: req.body.duration, date: date.toDateString(), id: person.id})
          new_excercise.save(function(err, data) {
            if (err) return console.error(err);
            res.json({"_id": data.id, "username":person.username, "date":data.date.toDateString(), "duration":data.duration, "description": data.description})
          });
        }
        else{
          res.status(400).send("User does not exist")
        }
    }
     
    })
  }
  else{
    res.status(400).send("Invalid id")
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})