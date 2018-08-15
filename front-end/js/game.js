
/* Authentication
––––––––––––––––––––––––––––––––––––––– */

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return false;
}

var username = getCookie("username");
var password = getCookie("password");

if (!username || !password) {
  alert("Critical Error Please Login Again. (Reset session by re-opening browser)");
}

var me = {};

$(function() {

  /* Initialisations
  ––––––––––––––––––––––––––––––––––––––– */

  var API = new APIClass();
  var socket = io.connect('http://localhost:3000');

  updateMap();

  /* Deprecated Stuff
  ––––––––––––––––––––––––––––––––––––––– */

  /* ## Depracted chat system ## (IGNORE)
  var now = new Date();
  $('#chat-input').submit(function(){
    if($('#message').val() != "") {
      socket.emit('chat message', {content: $('#message').val(), author: username, timeStamp: String(now.getUTCHours()+":"+now.getUTCMinutes()+":"+now.getUTCSeconds())});
      $('#message').val('');
    }
    return false;
  });*/

  // ## Depracted chat system ## (IGNORE)
  socket.on('chat message', function(msg) { // <-- Required for bug fix
    /*$('#chat-output').append($('<li>').text("["+msg.timeStamp+"] ["+msg.author+"] "+msg.content));
    $("#chat-output").animate({ scrollTop: $("#chat-output")[0].scrollHeight - $("#chat-output").height() }, 100);*/
  });

  socket.on('result', function(message) {
    alert(message);
  });

  /* Draw Functions
  ––––––––––––––––––––––––––––––––––––––– */

  function drawFarm(id, x, y, type, stage) {
    $(".y-" + y + ".x-" + x).css("background", "url('img/map/farm-" + type + "-" + stage + ".png')");
    $(".y-" + y + ".x-" + x).css("background-size", "contain");
    $(".y-" + y + ".x-" + x).addClass("farm"+id+" built");
  }

  function drawGrass(x, y) {
    $(".y-" + y + ".x-" + x).css("background", "url('../img/map/grass.png')");
    $(".y-" + y + ".x-" + x).css("background-size", "contain");
    $(".y-" + y + ".x-" + x).removeClass("grass");
  }

  function drawProducer(id, x, y, type) {
    $(".y-" + y + ".x-" + x).css("background", "url('img/map/" + type + ".gif')");
    $(".y-" + y + ".x-" + x).css("background-size", "contain");
    $(".y-" + y + ".x-" + x).addClass(type+id+" built");
  }

  function drawSelect(x, y, reason) {
    $(".y-" + y + ".x-" + x).css("background", "url('img/map/selected-tile.png')");
    $(".y-" + y + ".x-" + x).css("background-size", "contain");
    $(".y-" + y + ".x-" + x).addClass("selected");
    $(".y-" + y + ".x-" + x).addClass(reason);
  }

  function updateMap() {

    API.send("get-map", {username: username, password: password}, function (data) {
      for (var i = 0; i < 18; i++) {
        for (var j = 0; j < 18; j++) {
          drawGrass(i, j);
        }
      }

      for (var i = 0; i < data.length; i++) {
        var producer = data[i];

        if(producer.type == "farm") {
          drawFarm(producer.id, producer.x, producer.y, producer.subType, producer.growth);
        } else {
          drawProducer(producer.id, producer.x, producer.y, producer.type);
        }
      }
    });
  }

  /* Map Generation/Setups
  ––––––––––––––––––––––––––––––––––––––– */

  var total = 0;
  for (var i = 0; i < 18; i++) {
    for (var j = 0; j < 18; j++) {
      total++;
      $("#game-container").append("<div id='block-" + (total) + "' class='y-" + (i + 1) + " x-" + (j + 1) + "'> </div>");
    }
  }

  $(".modal-btn").click(function() {

    var target = $(this).attr('id').split('-')[0];
    if ($("#"+target+"-modal").css('display') == 'none') {
      $(".modal").css('display', 'none');
      $("#"+target+"-modal").css('display', 'block');

      API.get("items", function (items) {
        console.log(items);
        $("#shop-item-wrap").html("")
        for (var i = 0; i < items.length; i++) {
          var item = `
          <div class="shop-item" id='item-`+items[i].id+`'>
            <h2 class="item-name">`+items[i].name+`</h2>
            <div class="item-desc-wrap">
              <img src="`+items[i].image+`" alt="" class="item-img">
              <p class="item-desc">`+items[i].description+`</p>
            </div>
            <button class="item-buy-btn">$`+items[i].price+`</button>
          </div>
          `

          console.log('#item-6 > button:nth-child(3)');
          $('#item-'+items[i].id+' > button:nth-child(3)').click(function () {
            console.log("yas");
            API.send("buy-producer", {username: username, password: password, target: $(this).parent().parent().attr('id').split("-")[1]}, function () {
              console.log("Bought producer!");
            });
          });

          $("#shop-item-wrap").append(item);
        }
      });
    } else {
      $("#"+target+"-modal").css('display', 'none');
    }
  });

  /*window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }*/

  /* Block Interactions
  ––––––––––––––––––––––––––––––––––––––– */

  $(".farm0").click(function() {
    if ($(this).children().length == 0 && !$(this).hasClass("open")) {
      $(this).addClass("open");
      var classes = $(this).attr('class').split(" ");
      var x = classes[1].split("-")[1],
        y = classes[0].split("-")[1];

      $(this).append("<div class='info'><img src='img/exit.png' alt='exit' /><h1>House</h1><p>Houses NPCs.</p></div>")
    }
  }); // TODO: make code dynamic to all producers + add API

  $(document).on("click", ".info img", function() {
    $(this).parent().parent().removeClass("open");
    $(this).parent().remove();
  });

  /* New Code
  ––––––––––––––––––––––––––––––––––––––– */



});
