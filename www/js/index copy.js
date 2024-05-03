let db = null
let isDbReady = false

const SQL_CREATE_TABLE_TRIP ='CREATE TABLE IF NOT EXISTS `trip` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `nameOfTrip` TEXT,`destination` TEXT,`startDate` INTEGER, `riskYes` TEXT, `expenses` REAL, `description` TEXT, `travelFrom` TEXT)'
const SQL_SELECT_TRIP = 'SELECT `id`, `nameOfTrip`, `destination`, `startDate`, `riskYes`, `expenses`, `description`, `travelFrom` FROM `trip` ORDER BY `nameOfTrip` ASC'
const SQL_DELETE_TRIP = 'DELETE FROM `trip` WHERE `id` =?'
const SQL_DELETE_ALL_TRIP = 'DELETE FROM `trip`'

function showError(message) {
    navigator.vibrate(1000)
    navigator.notification.beep(1)
    navigator.notification.alert(message, null, 'Error', 'OK')
}

function searchFunction() {
    var input, filter, list, cards, headers, i, txtHeaders, txtDate, txtDestinations;
    input = document.getElementById("searchAll");
    filter = input.value.toUpperCase();
    list = document.getElementById("list");
    cards = list.getElementsByClassName("card");
    for (i = 0; i < cards.length; i++) {
        headers = cards[i].getElementsByClassName("card-header")[0];
        dates = cards[i].getElementsByClassName("card-text")[0];
        destinations = cards[i].getElementsByClassName("card-subtitle mb-2 text-body-secondary")[0];
        txtHeaders = headers.innerText;
        txtDate = dates.innerText;
        txtDestinations = destinations.innerText;
        if (txtHeaders.toUpperCase().indexOf(filter) > -1 || txtDate.toUpperCase().indexOf(filter) > -1|| txtDestinations.toUpperCase().indexOf(filter) > -1) {
            cards[i].style.display = "";
        } else {
            cards[i].style.display = "none";
        }
    }       
}

function refreshList() {
    if(!isDbReady){
        showError('Database not ready. Please try again later')
        return
    }

    db.transaction(
        function(tx) {
            tx.executeSql(
                SQL_SELECT_TRIP,
                [],
                function(tx, result) { //clear ui
                    $('#list').empty()
                    for(let index=0; index < result.rows.length; index++){
                        let h5_header = $('<h5></h5>').attr('data-id', result.rows.item(index).id).addClass('card-header').text(result.rows.item(index).nameOfTrip)
                            .on('click', function(){
                                let trip_id = $(this).attr('data-id')
                                navigator.notification.confirm(
                                    `For Trip ${result.rows.item(index).nameOfTrip}?`, // message
                                    function(buttonIndex){
                                        if(buttonIndex===2){
                                            deleteTrip(trip_id)
                                        }
                                        if(buttonIndex===1){
                                            getTripDetails(trip_id)
                                        }         
                                    }, 
                                    'Which do you like to choose?', // title
                                    ['Update','Delete','Cancel']    // buttonLabels
                                )
                            })
                        let h6_startDateText =  $('<h6></h6>').addClass('card-subtitle mb-3 text-body-secondary').text(`Date:`)
                        let h6_startDate =  $('<h6></h6>').addClass('card-text').text(result.rows.item(index).startDate)
                        
                        let h6_destinationText =  $('<h6></h6>').addClass('card-subtitle mb-3 text-body-secondary').text(`Destination:`)
                        let h6_destination =  $('<h6></h6>').addClass('card-subtitle mb-2 text-body-secondary').text(result.rows.item(index).destination)
                        
                        let h6_riskYesText =  $('<h6></h6>').addClass('card-subtitle mb-3 text-body-secondary').text(`Risk Assessment:`)
                        let h6_riskYes =  $('<h6></h6>').addClass('card-subtitle mb-3 text-body-secondary').text(result.rows.item(index).riskYes)

                        let h6_expensesText =  $('<h6></h6>').addClass('card-subtitle mb-3 text-body-secondary').text(`Expenses:`)
                        let h6_expenses =  $('<h6></h6>').addClass('card-subtitle mb-3 text-body-secondary').text(parseFloat(result.rows.item(index).expenses).toFixed(2))

                        let h6_travelFromText =  $('<h6></h6>').addClass('card-subtitle mb-3 text-body-secondary').text(`Travel From:`)
                        let h6_travelFrom =  $('<h6></h6>').addClass('card-subtitle mb-3 text-body-secondary').text(result.rows.item(index).travelFrom)

                        let h6_descriptionText =  $('<h6></h6>').addClass('card-subtitle mb-3 text-body-secondary').text(`Description:`)
                        let h6_description =  $('<h6></h6>').addClass('card-subtitle mb-3 text-body-secondary').text(result.rows.item(index).description)

                        let a_ViewExpnnses = $('<a></a>').attr('data-id', result.rows.item(index).id).addClass('btn btn-success').html(`View Expenses <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-database-add" viewBox="0 0 16 16">
                        <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Z"/>
                        <path d="M12.096 6.223A4.92 4.92 0 0 0 13 5.698V7c0 .289-.213.654-.753 1.007a4.493 4.493 0 0 1 1.753.25V4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16c.536 0 1.058-.034 1.555-.097a4.525 4.525 0 0 1-.813-.927C8.5 14.992 8.252 15 8 15c-1.464 0-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13h.027a4.552 4.552 0 0 1 0-1H8c-1.464 0-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10c.262 0 .52-.008.774-.024a4.525 4.525 0 0 1 1.102-1.132C9.298 8.944 8.666 9 8 9c-1.464 0-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777ZM3 4c0-.374.356-.875 1.318-1.313C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4Z"/>
                        </svg>`)
                            .on('click', function(){
                                let trip_id = $(this).attr('data-id')
                                window.location.href = `indexViewExpenses.html?tripid=${trip_id}`;
                            })

                        let divColStartDate1 = $('<div></div>').addClass('col').append(h6_startDateText)
                        let divColStartDate2 = $('<div></div>').addClass('col').append(h6_startDate)

                        let divColDestination1 = $('<div></div>').addClass('col').append(h6_destinationText)
                        let divColDestination2 = $('<div></div>').addClass('col').append(h6_destination)

                        let divColRiskYes1 = $('<div></div>').addClass('col').append(h6_riskYesText)
                        let divColRiskYes2= $('<div></div>').addClass('col').append(h6_riskYes)

                        let divColExpenses1 = $('<div></div>').addClass('col').append(h6_expensesText)
                        let divColExpenses2 = $('<div></div>').addClass('col').append(h6_expenses)

                        let divColTravelFrom1 = $('<div></div>').addClass('col').append(h6_travelFromText)
                        let divColTravelFrom2 = $('<div></div>').addClass('col').append(h6_travelFrom)

                        let divColDescription1 = $('<div></div>').addClass('col').append(h6_descriptionText)
                        let divColDescription2 = $('<div></div>').addClass('col').append(h6_description)

                        let divRow1 = $('<div></div>').attr('data-id', result.rows.item(index).id).addClass('row').append(divColStartDate1).append(divColStartDate2)
                            .on('click', function(){
                                let trip_id = $(this).attr('data-id')
                                navigator.notification.confirm(
                                    `For Trip ${result.rows.item(index).nameOfTrip}?`, // message
                                    function(buttonIndex){
                                        if(buttonIndex===2){
                                            deleteTrip(trip_id)
                                        }
                                        if(buttonIndex===1){
                                            getTripDetails(trip_id)
                                        }         
                                    }, 
                                    'Which do you like to choose?', // title
                                    ['Update','Delete','Cancel']    // buttonLabels
                                )
                            })
                        let divRow2 = $('<div></div>').attr('data-id', result.rows.item(index).id).addClass('row').append(divColDestination1).append(divColDestination2)
                            .on('click', function(){
                                let trip_id = $(this).attr('data-id')
                                navigator.notification.confirm(
                                    `For Trip ${result.rows.item(index).nameOfTrip}?`, // message
                                    function(buttonIndex){
                                        if(buttonIndex===2){
                                            deleteTrip(trip_id)
                                        }
                                        if(buttonIndex===1){
                                            getTripDetails(trip_id)
                                        }         
                                    }, 
                                    'Which do you like to choose?', // title
                                    ['Update','Delete','Cancel']    // buttonLabels
                                )
                            })
                        let divRow3 = $('<div></div>').attr('data-id', result.rows.item(index).id).addClass('row').append(divColRiskYes1).append(divColRiskYes2)
                            .on('click', function(){
                                let trip_id = $(this).attr('data-id')
                                navigator.notification.confirm(
                                    `For Trip ${result.rows.item(index).nameOfTrip}?`, // message
                                    function(buttonIndex){
                                        if(buttonIndex===2){
                                            deleteTrip(trip_id)
                                        }
                                        if(buttonIndex===1){
                                            getTripDetails(trip_id)
                                        }         
                                    }, 
                                    'Which do you like to choose?', // title
                                    ['Update','Delete','Cancel']    // buttonLabels
                                )
                            })
                        let divRow4 = $('<div></div>').attr('data-id', result.rows.item(index).id).addClass('row').append(divColExpenses1).append(divColExpenses2)
                            .on('click', function(){
                                let trip_id = $(this).attr('data-id')
                                navigator.notification.confirm(
                                    `For Trip ${result.rows.item(index).nameOfTrip}?`, // message
                                    function(buttonIndex){
                                        if(buttonIndex===2){
                                            deleteTrip(trip_id)
                                        }
                                        if(buttonIndex===1){
                                            getTripDetails(trip_id)
                                        }         
                                    }, 
                                    'Which do you like to choose?', // title
                                    ['Update','Delete','Cancel']    // buttonLabels
                                )
                            })
                        let divRow5 = $('<div></div>').attr('data-id', result.rows.item(index).id).addClass('row').append(divColTravelFrom1).append(divColTravelFrom2)
                            .on('click', function(){
                                let trip_id = $(this).attr('data-id')
                                navigator.notification.confirm(
                                    `For Trip ${result.rows.item(index).nameOfTrip}?`, // message
                                    function(buttonIndex){
                                        if(buttonIndex===2){
                                            deleteTrip(trip_id)
                                        }
                                        if(buttonIndex===1){
                                            getTripDetails(trip_id)
                                        }         
                                    }, 
                                    'Which do you like to choose?', // title
                                    ['Update','Delete','Cancel']    // buttonLabels
                                )
                            })
                        let divRow6 = $('<div></div>').attr('data-id', result.rows.item(index).id).addClass('row').append(divColDescription1).append(divColDescription2)
                            .on('click', function(){
                                let trip_id = $(this).attr('data-id')
                                navigator.notification.confirm(
                                    `For Trip ${result.rows.item(index).nameOfTrip}?`, // message
                                    function(buttonIndex){
                                        if(buttonIndex===2){
                                            deleteTrip(trip_id)
                                        }
                                        if(buttonIndex===1){
                                            getTripDetails(trip_id)
                                        }         
                                    }, 
                                    'Which do you like to choose?', // title
                                    ['Update','Delete','Cancel']    // buttonLabels
                                )
                            })
                        let divBody = $('<div></div>').addClass('card-body').append(divRow1).append(divRow2).append(divRow3).append(divRow4).append(divRow5).append(divRow6).append(a_ViewExpnnses)
                        let divCard = $('<div></div>').addClass('card').append(h5_header).append(divBody).css('margin-bottom', '1rem')
                        $('#list').append(divCard)
                    }
                },
                function(tx, error) { showError('Failed to retrieved data.') } 
            )
        }
    )
}

function deleteTrip(trip_id) {
    if (!isDbReady) {
        showError('Database not ready. Please try again later')
        return
    }

    db.transaction(
        function(tx) {
            tx.executeSql(
                SQL_DELETE_TRIP,
                [trip_id],
                function(tx, result) { //delete trip by id
                    refreshList()
                }, 
                function(tx, error) { showError('Failed to delete trip.') } 
            )
        }
    )
}

function deleteAllTrip() {
    if (!isDbReady) {
        showError('Database not ready. Please try again later')
        return
    }

    db.transaction(
        function(tx) {
            tx.executeSql(
                SQL_DELETE_ALL_TRIP,
                [],
                function(tx, result) { //delete all trip
                    refreshList()
                }, 
                function(tx, error) { showError('Failed to delete all trip.') } 
            )
        }
    )
}
  
function getTripDetails(trip_id) {
    window.location.href = `DetailsOfTrips.html?id=${trip_id}`;
}  

function addTrip() {
    window.location.href = "DetailsOfTrips.html";
}

function takePicture() {
    window.location.href = "TakePicture.html";
}

document.body.style.overflow = "visible";
document.addEventListener('deviceready', function(){
    console.log('Device is ready')
    Zepto(function($){
        $('#button-add').on('click', addTrip)
        $('#button-deleteAll').on('click', function(){
            navigator.notification.confirm(
                `You sure?`, // message
                function(buttonIndex){
                    if(buttonIndex===1){
                        deleteAllTrip()
                    }  
                }, 
                'Do you want to delete all', // title
                ['Delete All','Cancel']    // buttonLabels
            )
        })
        $('#button-takePicture').on('click', takePicture)

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
                            refreshList()
                            }, //SUCCESS CALLBACK
                            function(tx, error) { 
                            isDbReady = false 
                            console.log('SQL_CREATE_TABLE_TRIP', error.message)
                            }  //ERROR CALLBACK
                        )
                    },
                    function(error) { isDbReady = false }, //ERROR CALLBACK (DB)
                    function() {} //SUCCESS CALLBACK
                )
           },
           function (error){}
        )
    })
}, false)