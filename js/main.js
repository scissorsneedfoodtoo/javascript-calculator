$(document).ready(function() {

  var equation = [];
  var numbers = [];
  var printEquation = "";
  var currentNum = "";
  var lastNum = "";
  var last = "";
  var count = 0;
  var solved = false;
  var formula = ""; // from percent()
  var keyboardValues = [];
  var buttonValues = document.getElementsByClassName('btn');

  function calculator(current, currentPrint) {

    last = printEquation.slice(-1); //  original position

    if (current === 'del') {
      del();
    } else if (current === '=') {
      equals();
    } else if (currentPrint === '%') { // currentPrint used to determine if % or modulo
      percent(currentPrint);
    } else {
      printingPress(currentPrint, current, last);
    }

    // updateScreen(printEquation);
    console.log('printEquation: ' + printEquation, 'current: ' + current, 'last: ' + last, 'equation: ', equation, 'currentNum: ' + currentNum, 'lastNum: ' + lastNum, 'numbers: ', numbers, 'count: ', count, 'solved: ', solved);

  } // end calculator

  function updateScreen(val) {
    $('input:text').val(val);
  } // end updateScreen

  function printingPress(currentPrint, current, last) { // filters button inputs and prepares strings for calculation and printing to screen

    if (solved === true) { // resets false if value is entered
      solved = false;
    }

    if (printEquation.length === 0 && isNaN(currentPrint) && currentPrint !== '.' && currentPrint !== '-' && currentPrint !== "(") { // prevents operator as first character unless . or -
      return printEquation;
    } else if (isNaN(currentPrint) && isNaN(last) && currentPrint === last) { // prevents multiple same operators
      return printEquation;
    } else if (isNaN(currentPrint) && isNaN(last) && currentPrint !== last && last !== '.' && last !== '%' && last !== "(" && last !== ")" && last !== "x" && currentPrint !== '.' && currentPrint !== '-' && currentPrint !== '(') { // changes the operator if multiple are strung together unless %, -, or .
      printEquation = printEquation.slice(0, -1);
      printEquation += currentPrint;
      equation.pop();
      equation.push(current);
    } else {

      numPusher(currentPrint, current, last);

      if ($.isNumeric(current) && last === '%') { // special case for handling a number directly after % sign--after the numPusher function to ensure that the unmodified currentNum is pushed to the numbers array
        current = '*' + current;
      }

      equation.push(current);
      printEquation += currentPrint;
      return updateScreen(printEquation);
    }
  } // end printingPress

  function numPusher(currentPrint, current, last) {

    if (printEquation.length > 0 && isNaN(current) && current !== "." && currentNum !== "") { // filter to push to numbers arr for % calcs
      numbers.push(currentNum.toString()); // ensures number is string before pushed to the array
      lastNum = numbers[numbers.length - 1];
      currentNum = "";
      count++;
    } else if ($.isNumeric(current)) { // makes sure current number is number before pushing
      currentNum += current;
    }

  } // end numPusher

  function del() {
    var beforeLast = printEquation.slice(-2, -1);

    if (solved === true) {
      clearAll();
    }

    if (last === " ") { // in case of modulo
      printEquation = printEquation.slice(0, -4);
      currentNumSwitcher();
    } else { // if deleting numbers
      currentNum = currentNum.slice(0, -1);
    }

    if (isNaN(last) && $.isNumeric(beforeLast) && last !== ".") { // switches numbers if operator besides . or % and checks that beforeLast is a number--important when deleting chained operators
      currentNumSwitcher();
    }

    printEquation = printEquation.slice(0, -1);
    equation.pop();

    if (last === "%") { // handles case for % -- also must be at the bottom of the function to ensure that previous values aren't pushed too early only to be deleted
      currentNum.split('').map(function(element) {
        equation.push(element);
      });
    }

    return updateScreen(printEquation);

  } // end del

  function currentNumSwitcher() {

    currentNum = numbers[count - 1];
    lastNum = numbers[count - 2];
    numbers.pop();
    count = numbers.length;

  } // end currentNumSwitcher

  function percent(currentPrint) {

    if (printEquation.length === 0) { // special case to handle % being entered before number, just like the real android calc
      printEquation += currentPrint;
      equation.push(currentPrint);
      return updateScreen(printEquation);
    } else if (numbers.length === 0 && currentNum) {
      formula = currentNum + "/100";
    } else if (currentNum && lastNum) {
      formula = lastNum + "*" + currentNum + "/100";
    } else if (currentPrint === '%' && last === '%') { // case where multiple % signs are used, it should calculate the new number on the fly and update the equation accordingly
      var solution = math.eval(formula).toString();
      formula = solution + "/100";
    }

    equation = equation.slice(0, -currentNum.length);
    equation.push(formula);
    numPusher();

    printEquation += currentPrint;
    return updateScreen(printEquation);
  } // end percent

  function equals() {

    try {

      var solution = math.eval(equation.join('')).toString();
      printEquation = solution;
      currentNum = solution;
      equation = [];
      solution.split('').forEach(function(element) { // splits solution and pushes each element to equation for clean deletion or calculation
        equation.push(element);
      });

      numbers = []; // zeros out numbers array
      lastNum = ""; // zeros out lastNum;
      count = 0; // zeros out count;
      solved = true; // changes solved to true for del()
      return updateScreen(solution);

    } catch (err) {
      return updateScreen('Bad expression');
    }

  } // end equals

  function clearAll() {
    equation = [];
    numbers = [];
    printEquation = "";
    currentNum = "";
    solved = false;
    updateScreen();
  }

  function clickListener() {

    $('input:button').click(function() {
      var current = $(this).attr('id');
      var currentPrint = $(this).val();
      calculator(current, currentPrint);
    }); // end click

  } // end clickListener

  function keyboardListener() {

    $(document).on("keyup keypress", function(event) { // both keyup to detect del and keyup to get other inputs

      var current = "";
      var currentPrint = "";
      var eventString = String.fromCharCode(event.which);
      event.preventDefault();
      // console.log(event.which);

      function keyboardValueSearch(arr) {
        return arr.objKey === event.which;
      } // end keyboardValueSearch

      if (event.type === "keyup") {

        if (event.which === 8) { // catches backspace on keyup and immediately calls calc with new current to prevent "" from polluting equation array
          current = "del";
          calculator(current, currentPrint); // triggers del();
        }

      } else if (event.type === "keypress") { // keypress to detect all other inputs from keyboardValues arr

        if ($.isNumeric(eventString)) { // if value is a number
          current = currentPrint = eventString;
        } else if (event.which === 13) { // enter key
          current = "=";
        } else { // other value from keyboardValues arr

          var found = keyboardValues.find(keyboardValueSearch);

          current = found.id;
          currentPrint = found.val;
          // console.log(found);

        }
        calculator(current, currentPrint);
      }
    }); // end keypress

  } // end keyboardListener

  function getKeyboardValues() { // populates keyboardValue arr

    for (var i = 0; i < buttonValues.length; i++) {
      var objKey = buttonValues[i].id.charCodeAt();
      var id = buttonValues[i].id;
      var val = buttonValues[i].value;

      // console.log(objKey, id, val)

      keyboardValues.push({
        objKey,
        id,
        val
      });
    } // end for loop

  } // end getKeyboardValues

  $('input:text').prop('readonly', true); // similar to disabling textbox

  calculator();
  clickListener();
  keyboardListener();
  getKeyboardValues();

}); // end ready
