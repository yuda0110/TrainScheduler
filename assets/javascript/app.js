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
      const diffTime = moment().diff(moment(firstTimeConverted), 'minutes');
      const tRemainder = diffTime % tFrequency;
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

    renderTable: function (snapshot) {
      const key = snapshot.key;
      const snapshotVal = snapshot.val();

      const data = {};
      data.id = key;
      data.frequency = snapshotVal.frequency;
      data.firstTime = snapshotVal.firstTrainTime;
      trainSchedule.dataList.push(data);

      const minTillTrain = trainSchedule.minAway(snapshotVal.frequency, snapshotVal.firstTrainTime);
      const nextArrival = trainSchedule.nextArrivalTime(minTillTrain);

      const tr = $(`<tr id="${key}">`);
      const updateBtn = $('<button class="btn-update">').text('Update');
      const removeBtn = $('<button class="btn-remove">').text('Remove');
      updateBtn.attr('data-key', key);
      removeBtn.attr('data-key', key);

      tr.append(
        $('<td>').text(snapshotVal.trainName),
        $('<td>').text(snapshotVal.destination),
        $('<td>').text(snapshotVal.frequency),
        $(`<td id="next-arrival__${key}">`).text(nextArrival),
        $(`<td id="min-away__${key}">`).text(minTillTrain),
        $('<td>').append(updateBtn, removeBtn)
      );
      $('#schedule tbody').append(tr);
    },

    updateTablePerMin: function () {
      setInterval(function () {
        trainSchedule.dataList.forEach(function (item) {
          const minTillTrain = trainSchedule.minAway(item.frequency, item.firstTime);
          const nextArrival = trainSchedule.nextArrivalTime(minTillTrain);

          $(`#next-arrival__${item.id}`).text(nextArrival);
          $(`#min-away__${item.id}`).text(minTillTrain);
        });
      }, 60000);
    },

    dbErrorLog: function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    }
  };


  database.ref().on('child_added', function (snapshot) {
    trainSchedule.renderTable(snapshot);
  }, function(errorObject) {
    trainSchedule.dbErrorLog(errorObject);
  });

  database.ref().on('child_removed', function (snapshot) {
    // Get the key of the removed data and remove its html element from the table
    $(`#${snapshot.key}`).remove();

  }, function(errorObject) {
    trainSchedule.dbErrorLog(errorObject);
  });

  trainSchedule.updateTablePerMin();


  $('#add-train-btn').on('click', function (e) {
    e.preventDefault();

    trainSchedule.insertDataToDB();
    trainSchedule.emptyAllInputs();
  });

  $(document).on('click', '.btn-remove', function() {
    database.ref().child($(this).attr('data-key')).remove();
  });
});

