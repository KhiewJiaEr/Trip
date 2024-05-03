let db = null
let isDbReady = false
let params = new URL(window.location).searchParams;
let tripID= params.get('tripid');
console.log('tripid = ',tripID)

const SQL_CREATE_TABLE_EXPENSES ='CREATE TABLE IF NOT EXISTS `expense` (`expenseId` INTEGER PRIMARY KEY AUTOINCREMENT, `id` INTEGER, `expenseType` TEXT,  `expenseAmount` REAL, `expenseDate` INTEGER, `comments` TEXT)'
const SQL_SELECT_EXPENSES = 'SELECT * FROM `expense` WHERE `id`=? ORDER BY `expenseId` DESC'
const SQL_DELETE_EXPENSES = 'DELETE FROM `expense` WHERE `expenseId` =?'
const SQL_DELETE_ALL_EXPENSES = 'DELETE FROM `expense` WHERE `id` =?'
const SQL_SUM_ALL_EXPENSES = 'SELECT SUM(expenseAmount) FROM expense WHERE `id` =?'


function showError(message) {
    navigator.vibrate(1000)
    navigator.notification.beep(1)
    navigator.notification.alert(message, null, 'Error', 'OK')
}

function refreshList() {
    if(!isDbReady){
        showError('Database not ready. Please try again later')
        return
    }

    db.transaction(
        function(tx) {
            tx.executeSql(
                SQL_SELECT_EXPENSES,
                [tripID],
                function(tx, result) { //clear ui
                    $('#list').empty()
                    for(let index=0; index < result.rows.length; index++){
                        let h5_header = $('<h5></h5>').addClass('card-header').text(result.rows.item(index).expenseType)
                        
                        let h6_expenseAmountText =  $('<h6></h6>').addClass('card-subtitle mb-2 text-body-secondary').text(`Expense Amount:`)
                        let h6_expenseAmount =  $('<h6></h6>').addClass('card-subtitle mb-2 text-body-secondary').text(parseFloat(result.rows.item(index).expenseAmount).toFixed(2))

                        let h6_expenseDateText =  $('<h6></h6>').addClass('card-subtitle mb-2 text-body-secondary').text(`Expense Time:`)
                        let h6_expenseDate =  $('<h6></h6>').addClass('card-subtitle mb-2 text-body-secondary').text(result.rows.item(index).expenseDate)

                        let h6_commentsText =  $('<h6></h6>').addClass('card-subtitle mb-2 text-body-secondary').text(`Comments:`)
                        let h6_comments =  $('<h6></h6>').addClass('card-subtitle mb-2 text-body-secondary').text(result.rows.item(index).comments)

                        let divExpenseAmount1 = $('<div></div>').addClass('col').append(h6_expenseAmountText)
                        let divExpenseAmount2 = $('<div></div>').addClass('col').append(h6_expenseAmount)

                        let divExpenseDate1 = $('<div></div>').addClass('col').append(h6_expenseDateText)
                        let divExpenseDate2 = $('<div></div>').addClass('col').append(h6_expenseDate)

                        let divComments1 = $('<div></div>').addClass('col').append(h6_commentsText)
                        let divComments2 = $('<div></div>').addClass('col').append(h6_comments)

                        let divRow1 = $('<div></div>').addClass('row').append(divExpenseAmount1).append(divExpenseAmount2)
                        let divRow2 = $('<div></div>').addClass('row').append(divExpenseDate1).append(divExpenseDate2)
                        let divRow3 = $('<div></div>').addClass('row').append(divComments1).append(divComments2)

                        let divBody = $('<div></div>').addClass('card-body').append(divRow1).append(divRow2).append(divRow3)
                        let divCard = $('<div></div>').attr('data-id', result.rows.item(index).expenseId).addClass('card').append(h5_header).append(divBody).css('margin-bottom', '1rem')
                            .on('click', function(){
                                let expense_id = $(this).attr('data-id')
                                navigator.notification.confirm(
                                    `For ${result.rows.item(index).expenseType} Expense?`, // message
                                    function(buttonIndex){
                                        if(buttonIndex===2){
                                            deleteExpense(expense_id)
                                        }
                                        if(buttonIndex===1){
                                            getExpenseDetails(expense_id)
                                        }         
                                    }, 
                                    'Which do you like to choose?', // title
                                    ['Update','Delete','Cancel']    // buttonLabels
                                )
                            })
                        $('#list').append(divCard)
                    }
                },
                function(tx, error) { showError('Failed to retrieved data.') } 
            )
        }
    )

    db.transaction(
        function(tx) {
          tx.executeSql(
            SQL_SUM_ALL_EXPENSES,
            [tripID],
            function(tx, result) {
              // extract the sum value from the result set
              let sum = parseFloat(result.rows.item(0)['SUM(expenseAmount)']).toFixed(2);
              console.log('what is sum:', sum)
      
              // set the sum as the text content of the element with id "totalExpanses"
              $('#totalExpanses').text(sum);
            },
            function(tx, error) { showError('Failed to retrieve total expenses.') }
          )
        }
    );      
      
}

function deleteExpense(expense_id) {
    if (!isDbReady) {
        showError('Database not ready. Please try again later')
        return
    }

    db.transaction(
        function(tx) {
            tx.executeSql(
                SQL_DELETE_EXPENSES,
                [expense_id],
                function(tx, result) { //delete expense by id
                    refreshList()
                }, 
                function(tx, error) { showError('Failed to delete expense.') } 
            )
        }
    )
}

function deleteAllExpenses() {
    if (!isDbReady) {
        showError('Database not ready. Please try again later')
        return
    }

    db.transaction(
        function(tx) {
            tx.executeSql(
                SQL_DELETE_ALL_EXPENSES,
                [tripID],
                function(tx, result) { //delete all expense
                    refreshList()
                }, 
                function(tx, error) { showError('Failed to delete all expense.') } 
            )
        }
    )
}

function onBackClicked() {
    window.location.href = "index.html";
}

function getExpenseDetails(expense_id) {
    let tripID = params.get('tripid');
    window.location.href = `AddExpense.html?tripid=${tripID}&expenseid=${expense_id}`; // get tripID & expense_id to another page
}


function addExpense() {
    let tripID= params.get('tripid');
    window.location.href = `AddExpense.html?tripid=${tripID}`;
}

document.body.style.overflow = "visible";
document.addEventListener('deviceready', function(){
    console.log('Device is ready')
    Zepto(function($){
        $('#button-addExpense').on('click', addExpense);
        $('#button-deleteAll').on('click', function(){
            navigator.notification.confirm(
                `You sure?`, // message
                function(buttonIndex){
                    if(buttonIndex===1){
                        deleteAllExpenses()
                    }  
                }, 
                'Do you want to delete all', // title
                ['Delete All','Cancel']    // buttonLabels
            )
        })
        $('#button-back').on('click', onBackClicked)

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
                            refreshList()
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
    })
}, false)