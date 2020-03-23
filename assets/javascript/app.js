$(document).ready(function () {
// Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyBip3ACe6D9SK0XRQWsA24RMedaqzuRUPs",
    authDomain: "train-schedule-4d239.firebaseapp.com",
    databaseURL: "https://train-schedule-4d239.firebaseio.com",
    projectId: "train-schedule-4d239",
    storageBucket: "train-schedule-4d239.appspot.com",
    messagingSenderId: "340305875143",
    appId: "1:340305875143:web:54ce8d647b9a4dd2fd6ee2"
  };
// Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const database = firebase.database();

  const htmlEl = {
    trainName: $('#train-name'),
    destination: $('#destination'),
    firstTrainTime: $('#first-train-time'),
    frequency: $('#frequency')
  };

  const trainSchedule = {

  };

  database.ref().on('child_added', function (snapshot) {
    const tr = $('<tr>');
    tr.append(
      $('<td>').text(snapshot.val().trainName),
      $('<td>').text(snapshot.val().destination),
      $('<td>').text(snapshot.val().frequency),
      $('<td>').text(snapshot.val().firstTrainTime),
      $('<td>').text('')
    );
    $('#schedule tbody').append(tr);
  });


  $('#add-train-btn').on('click', function (e) {
    e.preventDefault();

    database.ref().push({
      trainName: htmlEl.trainName.val().trim(),
      destination: htmlEl.destination.val().trim(),
      firstTrainTime: htmlEl.firstTrainTime.val().trim(),
      frequency: parseInt(htmlEl.frequency.val().trim())
    });

    htmlEl.trainName.val('');
    htmlEl.destination.val('');
    htmlEl.firstTrainTime.val('');
    htmlEl.frequency.val('');
  });
});

