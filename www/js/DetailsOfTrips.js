let db = null
let isDbReady = false
let params = new URL(window.location).searchParams;
let id= params.get('id');
console.log('hello',id)

const SQL_CREATE_TABLE_TRIP ='CREATE TABLE IF NOT EXISTS `trip` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `nameOfTrip` TEXT,`destination` TEXT,`startDate` INTEGER, `riskYes` TEXT, `expenses` REAL, `description` TEXT, `travelFrom` TEXT)'
const SQL_INSERT_TRIP = 'INSERT INTO `trip`(`nameOfTrip`, `destination`, `startDate`, `riskYes`, `expenses`, `description`, `travelFrom`) VALUES (?, ?, ?, ?, ?, ?, ?)'
const SQL_SELECT_TRIP = 'SELECT `id`, `nameOfTrip`, `destination`, `startDate`, `riskYes`, `expenses`, `description`, `travelFrom` FROM `trip` ORDER BY `id` DESC'
const SQL_GET_TRIP_BY_ID = 'SELECT * FROM `trip` WHERE `id` =?'
const SQL_UPDATE_TRIP = 'UPDATE `trip` SET `nameOfTrip` =?, `destination` =?, `startDate` =?, `riskYes` =?, `expenses` =?, `description` =?, `travelFrom` =? WHERE `id`=?' 

function onSaveClicked(){
    if(!isDbReady){
        showError('Database not ready. Please try again later')
        return
    }

    //get input from UI
    let nameOfTrip = $.trim($('#text-name').val())
    let destination = $.trim($('#text-destination').val())
    let startDate = $.trim($('#text-date').val())
    let riskYes = $('input[name="risk"]:checked').val();
    let expenses = $.trim($('#text-expenses').val())
    let description = $.trim($('#text-description').val())
    let travelFrom = $.trim($('#text-travelFrom').val())

    //ensure input is not empty
    //show error message and vibrate if required input is empty
    if (nameOfTrip === '' || destination === '' || startDate === ''|| $('input[name="risk"]:checked').length == 0 || expenses === ''){
        showError("Please fill in all the required fields")
        return
    }else{
        window.location.href = 'index.html';
    }

    db.transaction(
        function(tx) {
            tx.executeSql(
                SQL_INSERT_TRIP,
                [nameOfTrip, destination, startDate, riskYes, expenses, description, travelFrom],
                function(tx, result) { 
                    $('text-name').val('')
                    $('text-destination').val('')
                    $('text-date').val('')
                    $('input[name="risk"]:checked').val('')
                    $('text-expenses').val('')
                    $('text-description').val('')
                    $('text-travelFrom').val('')
                },
                function (tx, error) { showError('Failed to add trip')}
            )
        }
    )
}

function showError(message) {
    navigator.vibrate(1000)
    navigator.notification.beep(1)
    navigator.notification.alert(message, null, 'Error', 'OK')
}

function onUpdateClicked(id) {
    if(!isDbReady){
        showError('Database not ready. Please try again later')
        return
    }

    let trip_id = params.get('id');

    //get input from UI
    let nameOfTrip = $.trim($('#text-name').val())
    let destination = $.trim($('#text-destination').val())
    let startDate = $.trim($('#text-date').val())
    let riskYes = $('input[name="risk"]:checked').val();
    let expenses = $.trim($('#text-expenses').val())
    let description = $.trim($('#text-description').val())
    let travelFrom = $.trim($('#text-travelFrom').val())

    //ensure input is not empty
    //show error message and vibrate if required input is empty
    if (nameOfTrip === '' || destination === '' || startDate === ''|| $('input[name="risk"]:checked').length == 0 || expenses === ''){
        showError("Please fill in all the required fields")
        return
    }else{
        window.location.href = 'index.html';
    }

    db.transaction(
        function(tx) {
            tx.executeSql(
                SQL_UPDATE_TRIP,
                [nameOfTrip, destination, startDate, riskYes, expenses, description, travelFrom, trip_id],
                function(tx, result) { 
                    $('text-name').val('')
                    $('text-destination').val('')
                    $('text-date').val('')
                    $('input[name="risk"]:checked').val('')
                    $('text-expenses').val('')
                    $('text-description').val('')
                    $('text-travelFrom').val('')
                },
                function (tx, error) { showError('Failed to update trip')}
            )
        }
    )
}

function onBackClicked() {
    window.location.href = "index.html";
}

document.body.style.overflow = "visible";
document.addEventListener('deviceready', function(){
    console.log('Device is ready')
    Zepto(function($){
        $('#button-update').on('click', onUpdateClicked)
        $('#button-save').on('click', onSaveClicked)
        $('#button-back').on('click', onBackClicked)

        db = window.sqlitePlugin.openDatabase(
           { 'name':'trip.db', 'location':'default' },
           function (database) { //SUCCESS CALLBACK
                db = database
                db.transaction(
                    function(tx) {
                        tx.executeSql(  
                            SQL_CREATE_TABLE_TRIP,
                            [],
                            function(tx, result) { 
                            isDbReady = true
                            console.log('SQL_CREATE_TABLE_TRIP', 'OK')
                            }, //SUCCESS CALLBACK
                            function(tx, error) { 
                            isDbReady = false 
                            console.log('SQL_CREATE_TABLE_TRIP', error.message)
                            }  //ERROR CALLBACK
                        )
                    },
                    function(error) { isDbReady = false } //ERROR CALLBACK (DB)
                )
           }
        )

        let trip_id = params.get('id');
        console.log('update load',trip_id)
        
        db.transaction(
            function(tx) {
                tx.executeSql(
                    SQL_GET_TRIP_BY_ID,
                    [trip_id],
                    function(tx, result) {
                        // Check that the result object contains the expected data fields
                        console.log(result.rows.item(0));
        
                        // Store the retrieved data fields in variables with meaningful names
                        var tripName = result.rows.item(0).nameOfTrip;
                        var destination = result.rows.item(0).destination;
                        var startDate = result.rows.item(0).startDate;
                        var riskValue = result.rows.item(0).riskYes;
                        var expenses = parseFloat(result.rows.item(0).expenses).toFixed(2);
                        var description = result.rows.item(0).description;
                        var travelFrom = result.rows.item(0).travelFrom;
        
                        console.log('Expenses is: ', expenses);

                        // Populate the form fields with the retrieved data
                        $("#text-name").val(tripName);
                        $('#text-destination').val(destination);
                        $('#text-date').val(startDate);
                        $('input[name="risk"][value="' + riskValue + '"]').prop('checked', true);
                        $('#text-expenses').val(expenses);
                        $('#text-description').val(description);
                        $('#text-travelFrom').val(travelFrom);
                    },
                    function(tx, error) {
                        // Handle any errors that occur during the query
                        console.error("Failed to retrieve trip data: " + error.message);
                        showError('Failed to find trip');
                    }
                );
            }
        );
        
        
    })
}, false)