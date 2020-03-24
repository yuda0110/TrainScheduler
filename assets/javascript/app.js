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
    dataList: [],

    nextArrivalTime: function (minTillTrain) {
      const nextTrain = moment().add(minTillTrain, 'minutes');
      return moment(nextTrain).format("HH:mm");
    },

    minAway: function (tFrequency, firstTime) {
      const firstTimeConverted = moment(firstTime, 'HH:mm').subtract(1, 'years');
      console.log('firstTimeConverted:' + firstTimeConverted);

      const currentTime = moment();
      console.log('current time: ' + moment(currentTime).format('hh:mm'));

      const diffTime = moment().diff(moment(firstTimeConverted), 'minutes');
      console.log("DIFFERENCE IN TIME: " + diffTime);

      const tRemainder = diffTime % tFrequency;
      console.log('Time apart' + tRemainder);

      console.log("MINUTES TILL TRAIN: " + (tFrequency - tRemainder));
      return tFrequency - tRemainder;
    },

    emptyAllInputs: function () {
      htmlEl.trainName.val('');
      htmlEl.destination.val('');
      htmlEl.firstTrainTime.val('');
      htmlEl.frequency.val('');
    },

    insertDataToDB: function () {
      database.ref().push({
        trainName: htmlEl.trainName.val().trim(),
        destination: htmlEl.destination.val().trim(),
        firstTrainTime: htmlEl.firstTrainTime.val().trim(),
        frequency: parseInt(htmlEl.frequency.val().trim())
      });
    },

    updateTable: function (nextArrival, minTillTrain) {
      const tr = $('<tr>');
      tr.append(
        $('<td>').text(snapshot.val().trainName),
        $('<td>').text(snapshot.val().destination),
        $('<td>').text(snapshot.val().frequency),
        $('<td>').text(nextArrival),
        $('<td>').text(minTillTrain)
      );
      $('#schedule tbody').append(tr);
    }
  };


  database.ref().on('child_added', function (snapshot) {
    const key = snapshot.key;
    console.log('key: ' + key);

    const data = {};
    data.id = key;
    data.frequency = snapshot.val().frequency;
    data.firstTime = snapshot.val().firstTrainTime;
    trainSchedule.dataList.push(data);

    console.log(trainSchedule.dataList);

    const minTillTrain = trainSchedule.minAway(snapshot.val().frequency, snapshot.val().firstTrainTime);
    const nextArrival = trainSchedule.nextArrivalTime(minTillTrain);

    const tr = $('<tr>');
    tr.append(
      $('<td>').text(snapshot.val().trainName),
      $('<td>').text(snapshot.val().destination),
      $('<td>').text(snapshot.val().frequency),
      $(`<td id="next-arrival__${key}">`).text(nextArrival),
      $(`<td id="min-away__${key}">`).text(minTillTrain)
    );
    $('#schedule tbody').append(tr);
  }, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
  });

  setInterval(function () {
    trainSchedule.dataList.forEach(function (item) {
      const minTillTrain = trainSchedule.minAway(item.frequency, item.firstTime);
      const nextArrival = trainSchedule.nextArrivalTime(minTillTrain);

      $(`#next-arrival__${item.id}`).text(nextArrival);
      $(`#min-away__${item.id}`).text(minTillTrain);

      console.log('nextArrival: ' + nextArrival);
      console.log('minTillTrain: ' + minTillTrain);
    });
  }, 60000);


  $('#add-train-btn').on('click', function (e) {
    e.preventDefault();

    trainSchedule.insertDataToDB();

    trainSchedule.emptyAllInputs();
  });
});

