/* jshint browser: true, jquery: true, camelcase: true, indent: 2, undef: true, quotmark: single, maxlen: 80, trailing: true, curly: true, eqeqeq: true, forin: true, immed: true, latedef: true, newcap: true, nonew: true, unused: true, strict: true */

var WaitClick;
var AddQuestionFunction;
var AnswerQuestionOne;
var GetScore;
var GetQuestionNew;
var USERNAME;

var socket = io();

//score display
var ScoreUpdate = function(scoreObject){
  'use strict';
  $('.ScoreCorrect').empty();
  $('.ScoreCorrect').append(
    '<div><h3>Correct: ' + scoreObject.right + '</h3></div>'
  );

  $('.ScoreIncorrect').empty();
  $('.ScoreIncorrect').append(
    '<div><h3>Wrong: ' + scoreObject.wrong + '</h3></div>'
  );
};//end ScoreUpdate
//dispay a new question
var AdjustQuestion = function(questionObject){
  'use strict';
  $('.oneQuestion').empty();
  $('.oneQuestion').append(
    '<h3>Player:</h3>' +
    '<label class="playerName" name="playerValue">' +
    USERNAME + '</label>' +
    '<div class="field NewQuestion">' +
    '<label class="questionPlace"><h3>' +
    questionObject.question +
    '</h3></label>' +
    '<lable class="idPlace">' +
    questionObject.answerId +
    '</label>' +
    '<input type="text" class="answerClass" placeholder="answer">' +
    '</div>' +
    '<button class="ui button fluid teal large ToAnswer"' +
    'id="AnswerToThis" type="button">Answer</button>'
  );
  WaitClick();
};//end AdjustQuestion

function WaitUser(){
  'use strict';
  $('.addInUser').click(function(){
    USERNAME = document.getElementsByName('NameOfUser')[0].value;
    socket.emit('IOName', USERNAME);
    console.log(USERNAME);
    GetQuestionNew();
  });
}

socket.on('IOName', function(msg, data1, data2){
 $('#userList').append($('<li>').html(
   '<div class="item"><div class="content">' +
   '<div class="header">' +
   msg + '</div>' +
   '<i class="check green big circle icon"></i>' + data1 +
   '  - - - <i class="check red big remove circle icon"></i>:' + data2 +
   '</div></div>' +
   '<div class="ui divider"></div>'));
})

socket.on('IONameEmpty', function(){
  $('#userList').empty();
})

socket.on('AltScore', function(UserIn,scoreRightIn, scoreWrongIn){
  if(UserIn === USERNAME){
    var tempScore = {'right': scoreRightIn, 'wrong': scoreWrongIn};
    ScoreUpdate(tempScore);
  }
})

socket.on('EndScore', function(UserIn,scoreRightIn, scoreWrongIn){
  if(UserIn === USERNAME){
    var tempScore = {'right': scoreRightIn, 'wrong': scoreWrongIn};
    ScoreUpdate(tempScore);

    $('.oneQuestion').empty();
    $('.oneQuestion').append(
      '<h2>Result:</h2>' +
      '<label class="playerName" name="playerValue"><h3>' +
      USERNAME + '\'s total score out of 10 questions is </h3></label>' +
      '<div><h3> Right: ' + scoreRightIn + '</h3></div>' +
      '<div><h3> Wrong: ' + scoreWrongIn + '</h3></div>' +
      '<a href="http://localhost:3000"' +
      'class="ui button fluid teal large FinRoung"' +
      'id="EndRound" type="button">' +
      'Begin Again</a>'+
      '<div>**Begin Again will delete everything include previour attemp</div>'
    );
  }
})


//function that always listening
var main = function(){
  'use strict';
  //socket.emit('IOName', USERNAME);

  $('.addQuestion').form({
    fields: {
        addquestionholder: {
          identifier : 'addquestion-holder',
            rules: [
              {
                type   : 'empty',
                prompt : 'Please enter a question'
              }
            ]
          },
          addanswerholder: {
              identifier : 'addanswer-holder',
              rules: [
                {
                  type   : 'empty',
                  prompt : 'Please enter a answer'
                }
                ]
            }
        },
    onSuccess: function(event) {
      event.preventDefault();
      AddQuestionFunction();
      $('.newQuestion').val('');
      $('.newAnswer').val('');
      //GetQuestionNew();
      console.log('form valid');
    }
  });
  EnterUserName();

  //GetQuestionNew();
};//big loop

function EnterUserName(){
  'use strict';
  $('.oneQuestion').append(
    '<label><h3>Enter Username To Begin the Game</h3></label>'+
    '<input type="text" class="userNameIO" name="NameOfUser">' +
    '<button class="ui button fluid teal large addInUser"' +
    'id="AnswerToThis" type="button">Start the Round</button>'
  );
  WaitUser();
}//end EnterUserName

//ajax when answer the question
function AnswerQuestionOne(){
  'use strict';

  var aToSend = $('.answerClass').val();
  var idToSend = $('.idPlace').text();
  var jsonStr = JSON.stringify({
                  'answer': aToSend.toUpperCase(), 'answerId': idToSend});
  console.log(jsonStr);
  $.ajax({
          type: 'POST',
          data: jsonStr,
          dataType: 'json',
          contentType: 'application/json',
          url: 'http://localhost:3000/answer',
          success: function(data){
            console.log(data);
            if(data.correct === true){
              console.log('Correct');
                socket.emit('scoreUp',USERNAME, 1);
            }
            else{
              console.log('Wrong');
              socket.emit('scoreUp',USERNAME, 0);
            }
          }
  });

}//end AnswerQuestion

//ajax when the score need update
function GetScore(){
  'use strict';
  console.log('retieve score');
  $.ajax({
          type: 'GET',
          dataType: 'json',
          contentType: 'application/json',
          url: 'http://localhost:3000/score',
          success: function(data){
            console.log(data);
            socket.emit('getScore', USERNAME);
            //ScoreUpdate(data);
          }
  });
}//end GetScore

//ajax retive one question get it at randome by server
function GetQuestionNew(){
  'use strict';
  console.log('retieve question');
  $.ajax({
          type: 'GET',
          dataType: 'json',
          contentType: 'application/json',
          url: 'http://localhost:3000/question',
          success: function(data){
            console.log('success retirve');
            console.log(data);

            if(data.answerId === 0)
            {
              $('.oneQuestion').empty();
              $('.oneQuestion').append('<h3>Add the question first</h3>' +
                '<div><button class="ui grey button"href="localhost:3000">' +
                'Click when question is added</button></div>'
              );
            }
            else{
              AdjustQuestion(data);
              GetScore();
            }
          }
    });

}//end GetQuestionNew

//ajax added question to the db
function AddQuestionFunction(){
  'use strict';

  var qToSend = document.getElementsByName('addquestion-holder')[0].value;
  var aToSend = document.getElementsByName('addanswer-holder')[0].value;
  var jsonStr = JSON.stringify({'question': qToSend,
                                  'answer': aToSend.toUpperCase()});
  console.log(jsonStr);

  $.ajax({
          type: 'POST',
          data: jsonStr,
          dataType: 'json',
          contentType: 'application/json',
          url: 'http://localhost:3000/question',
          success: function(){
            console.log('send quesition complete');
          }

  });

}//end AddQuestionFunction

//wait for user to answer
function WaitClick(){
  'use strict';
  $('#AnswerToThis').click(function(){
    console.log('ToAnswer');
    AnswerQuestionOne();
    GetQuestionNew();
  });
}

$(document).ready(main);
