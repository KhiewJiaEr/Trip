let db = null
let isDbReady = false
let params = new URL(window.location).searchParams;
let tripID= params.get('tripid');
let expense_id= params.get('expenseid');
console.log('tripid = ',tripID)
console.log('expenseid = ',expense_id)

const SQL_CREATE_TABLE_EXPENSES ='CREATE TABLE IF NOT EXISTS `expense` (`expenseId` INTEGER PRIMARY KEY AUTOINCREMENT, `id` INTEGER, `expenseType` TEXT,  `expenseAmount` REAL, `expenseDate` INTEGER, `comments` TEXT)'
const SQL_INSERT_EXPENSES = 'INSERT INTO `expense`(`id`, `expenseType`, `expenseAmount`, `expenseDate`, `comments`) VALUES (?, ?, ?, ?, ?)'
const SQL_SELECT_EXPENSES = 'SELECT `expenseId`, `id`, `expenseType`, `expenseAmount`, `expenseDate`, `comments` FROM `expense` WHERE `id`=? ORDER BY `expenseId` DESC'
const SQL_GET_EXPENSES_BY_ID = 'SELECT * FROM `expense` WHERE `expenseId` =?'
const SQL_UPDATE_EXPENSES = 'UPDATE `expense` SET `expenseType` =?, `expenseAmount` =?, `expenseDate` =?, `comments` =? WHERE `expenseId` =?'

function onSaveClicked(){
    if(!isDbReady){
        showError('Database not ready. Please try again later')
        return
    }

    //get input from UI
    let tripID= params.get('tripid');
    let expenseType = $.trim($('#text-expenseType').val())
    let expenseAmount = $('#text-expenseAmount').val();
    if (!isNaN(expenseAmount) && expenseAmount.trim() !== '') {
        expenseAmount = parseFloat(expenseAmount).toFixed(2);
    }else{
        showError("Please fill in all the required fields")
        return
    }
    let expenseDate = $.trim($('#text-expenseDate').val())
    let comments = $.trim($('#text-comments').val())

    //ensure input is not empty
    //show error message and vibrate if required input is empty
    if (expenseType === '' || expenseAmount === '' || expenseDate === ''){
        showError("Please fill in all the required fields")
        return
    }else{
        let tripID= params.get('tripid');
        window.location.href = `indexViewExpenses.html?tripid=${tripID}`;
    }

    db.transaction(
        function(tx) {
            tx.executeSql(
                SQL_INSERT_EXPENSES,
                [tripID, expenseType, expenseAmount, expenseDate, comments],
                function(tx, result) { 
                    $('text-expenseType').val('')
                    $('text-expenseAmount').val('')
                    $('text-expenseDate').val('')
                    $('text-comments').val('')
                },
                function (tx, error) { showError('Failed to add expense')}
            )
        },
        function(error) {},
        function () {}
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

    //get input from UI
    let expenseType = $.trim($('#text-expenseType').val())
    let expenseAmount = $('#text-expenseAmount').val();
    if (!isNaN(expenseAmount) && expenseAmount.trim() !== '') {
        expenseAmount = parseFloat(expenseAmount).toFixed(2);
    }else{
        showError("Please fill in all the required fields")
        return
    }
    let expenseDate = $.trim($('#text-expenseDate').val())
    let comments = $.trim($('#text-comments').val())

    //ensure input is not empty
    //show error message and vibrate if required input is empty
    if (expenseType === '' || expenseAmount === '' || expenseDate === ''){
        showError("Please fill in all the required fields")
        return
    }else{
        let tripID= params.get('tripid');
        window.location.href = `indexViewExpenses.html?tripid=${tripID}`;
    }

    db.transaction(
        function(tx) {
            tx.executeSql(
                SQL_UPDATE_EXPENSES,
                [expenseType, expenseAmount, expenseDate, comments, expense_id],
                function(tx, result) { 
                    $('text-expenseType').val('')
                    $('text-expenseAmount').val('')
                    $('text-expenseDate').val('')
                    $('text-comments').val('')
                },
                function (tx, error) { showError('Failed to update trip')}
            )
        },
        function(error) {},
        function () {}
    )
}

function onBackClicked() {
    let tripID= params.get('tripid');
    window.location.href = `indexViewExpenses.html?tripid=${tripID}`;
}

document.body.style.overflow = "visible";
document.addEventListener('deviceready', function(){
    console.log('Device is ready')
    Zepto(function($){
        $('#button-save').on('click', onSaveClicked)
        $('#button-update').on('click', onUpdateClicked)
        $('#button-backExpense').on('click', onBackClicked)

        db = window.sqlitePlugin.openDatabase(
           { 'name':'trip.db', 'location':'default' },
           function (database) { //SUCCESS CALLBACK
                db = database
                db.transaction(
                    function(tx) {
                        tx.executeSql(  
                            SQL_CREATE_TABLE_EXPENSES,
                            [],
                            function(tx, result) { 
                            isDbReady = true
                            console.log('SQL_CREATE_TABLE_EXPENSES', 'OK')
                            }, //SUCCESS CALLBACK
                            function(tx, error) { 
                            isDbReady = false 
                            console.log('SQL_CREATE_TABLE_EXPENSES', error.message)
                            }  //ERROR CALLBACK
                        )
                    },
                    function(error) { isDbReady = false }, //ERROR CALLBACK (DB)
                    function() {} //SUCCESS CALLBACK
                )
           },
           function (error){}
        )

        db.transaction(
            function(tx) {
                tx.executeSql(
                    SQL_GET_EXPENSES_BY_ID,
                    [expense_id],
                    function(tx, result) {
                        // Check that the result object contains the expected data fields
                        console.log(result.rows.item(0));

                        // Store the retrieved data fields in variables with meaningful names
                        let expenseType = result.rows.item(0).expenseType;
                        let expenseAmount = parseFloat(result.rows.item(0).expenseAmount).toFixed(2);
                        let expenseDate = result.rows.item(0).expenseDate;
                        let comments = result.rows.item(0).comments;        

                        // Populate the form fields with the retrieved data
                        $("#text-expenseType").val(expenseType);
                        $('#text-expenseAmount').val(expenseAmount);
                        $('#text-expenseDate').val(expenseDate);
                        $('#text-comments').val(comments);
                        
                    },
                    function(tx, error) {
                        // Handle any errors that occur during the query
                        console.error("Failed to retrieve expense data: " + error.message);
                        showError('Failed to find expense');
                    }
                );
            }
        );
    })
}, false)