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

    getCurrentData: function (key) {
      database.ref('/' + key).once('value').then(function(snapshot) {
        const data = {};
        const trainName = (snapshot.val() && snapshot.val().trainName) || 'Anonymous';
        const destination = (snapshot.val() && snapshot.val().destination) || 'Anonymous';
        const frequency = (snapshot.val() && snapshot.val().frequency) || '1';
        const firstTrainTime = (snapshot.val() && snapshot.val().firstTrainTime) || '00:00';

        data['trainName'] = trainName;
        data['destination'] = destination;
        data['frequency'] = frequency;
        data['firstTrainTime'] = firstTrainTime;

        console.log('getCurrentData======');
        console.log(data);

        return data;
      });
    },

    updateData: function (key) {
      console.log('key!!!!!: ' + key);

      let firstTime = '00:00';

      this.dataList.forEach(function (data) {
        if (data.id === key) {
          firstTime = data.firstTime;
        }
      });

      const editedData = {
        trainName: $('#new-train-name').val().trim(),
        destination: $('#new-destination').val().trim(),
        firstTrainTime: firstTime.trim(),
        frequency: parseInt($('#new-frequency').val().trim())
      };

      const updates = {};
      updates[`/${key}`] = editedData;

      return database.ref().update(updates);
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
      const tbody = $('#schedule tbody');

      tr.append(
        $('<td class="td__train-name">').text(snapshotVal.trainName),
        $('<td class="td__destination">').text(snapshotVal.destination),
        $('<td class="td__frequency">').text(snapshotVal.frequency),
        $(`<td id="next-arrival__${key}">`).text(nextArrival),
        $(`<td id="min-away__${key}">`).text(minTillTrain),
        $('<td>').append(updateBtn, removeBtn)
      );

      const renderedTr = $(`#${key}`);
      if (renderedTr) {
        renderedTr.remove();
      }

      tbody.append(tr);
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
    },

    renderEditForm: function (key) {
      const trainNameVal = $(`#${key} .td__train-name`).text();
      const destinationVal = $(`#${key} .td__destination`).text();
      const frequencyVal = $(`#${key} .td__frequency`).text();

      const darkBg = $('<div class="dark-bg">');

      const editTrainEl = $('<section id="edit-train">');
      const h3El = $('<h3>').text('Edit Train Schedule');
      const formEl = $(`<form>`);
      const formGroupEl1 = $('<div class="form-group">');
      const trainNameLabel = $('<label for="train-name">').text('Train Name');
      const trainNameInput = $(`<input id="new-train-name" type="text" value="${trainNameVal}" required>`);
      $(formGroupEl1).append(trainNameLabel, trainNameInput);
      const formGroupEl2 = $('<div class="form-group">');
      const destinationLabel = $('<label for="destination">').text('Destination');
      const destinationInput = $(`<input id="new-destination" type="text" value="${destinationVal}" required>`);
      $(formGroupEl2).append(destinationLabel, destinationInput);
      const formGroupEl3 = $('<div class="form-group">');
      const frequencyLabel = $('<label for="frequency">').text('Frequency');
      const frequencyInput = $(`<input id="new-frequency" type="text" value="${frequencyVal}" required>`);
      $(formGroupEl3).append(frequencyLabel, frequencyInput);
      const updateBtn = $(`<button id="update-train-btn" class="btn-form btn-submit" data-key="${key}">`).text('Update');
      const cancelBtn = $('<button id="cancel-btn" class="btn-form btn-cancel">').text('Cancel');
      $(formEl).append(formGroupEl1, formGroupEl2, formGroupEl3, updateBtn, cancelBtn);
      $(editTrainEl).append(h3El, formEl);
      $('body').append(darkBg, editTrainEl);
    },

    removeEditForm: function () {
      $('#edit-train').remove();
      $('.dark-bg').remove();
    }
  };


  database.ref().on('child_added', function (snapshot) {
    trainSchedule.renderTable(snapshot);
  }, function(errorObject) {
    trainSchedule.dbErrorLog(errorObject);
  });

  database.ref().on('child_changed', function (snapshot) {
    console.log('child_changed');
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

  $(document).on('click', '#update-train-btn', function (e) {
    e.preventDefault();

    trainSchedule.updateData($(this).attr('data-key'));
    trainSchedule.removeEditForm();
  });

  $(document).on('click', '.btn-remove', function() {
    database.ref().child($(this).attr('data-key')).remove();
  });

  $(document).on('click', '.btn-update', function() {
    // Render a form to update Train Name, Destination, and Frequency

    const key = $(this).attr('data-key');
    console.log('btn-update key:' + key);

    trainSchedule.renderEditForm(key);
  });

  $(document).on('click', '.dark-bg', function () {
    trainSchedule.removeEditForm();
  });

  $(document).on('click', '#cancel-btn', function () {
    trainSchedule.removeEditForm();
  });

});




