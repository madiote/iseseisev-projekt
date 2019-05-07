/* jshint esversion: 6 */
document.addEventListener('DOMContentLoaded', function () {

  // Game options
  const rows = 10;
  const columns = 8;
  let currentRow = 0;

  // Default options
  Muuri.defaultOptions.dragAxis = 'x';

  // Variables
  let grid = null;
  let docElem = document.documentElement;
  let demo = document.querySelector('.grid-demo');
  let gridElement = demo.querySelector('.grid');
  let filterOptions = ['red', 'orange', 'yellow', 'blue', 'green', 'purple'];

  let uuid = 0;

  //
  // Grid helper functions
  //

  function initDemo() {
    initGrid();
  }

  function initGrid() {
    let dragCounter = 0;
    // Two rows initially
    let initItems = generateARow();
    initItems = initItems.concat(generateARow());

    grid = new Muuri(gridElement, {
        items: initItems,
        layoutDuration: 400,
        layoutEasing: 'ease',
        layout: {
          horizontal: false,
          alignRight: false,
          alignBottom: false,
          fillGaps: false
        },
        dragEnabled: true,
        dragSortInterval: 50,
        dragContainer: document.body,
        dragStartPredicate: function (item, event) {
          if (event.deltaTime > 50 && !elementMatches(event.target.parentNode.parentNode, '.transparent')) {
            return Muuri.ItemDrag.defaultStartPredicate(item, event);
          }
        },
        dragReleaseDuration: 400,
        dragReleaseEasing: 'ease'
      })
      .on('dragStart', function () {
        ++dragCounter;
        docElem.classList.add('dragging');
      })
      .on('dragEnd', function () {
        if (--dragCounter < 1) {
          docElem.classList.remove('dragging');
        }
      })
      .on('move', addItems)
      .on('sort', updateIndices);
  }

  function addItems() {
    // Generate new elements.
    let newElems = generateARow();

    // Add the elements to the grid.
    let newItems = grid.add(newElems);

    // Update UI indices.
    updateIndices();
    //rowsToArray();

    if (currentRow >= rows - 1) {
      grid._settings.dragEnabled = false; // disable dragging to prevent loops
      setTimeout(function () { // wait 2 sec for the last row to load
        window.alert("Mäng läbi!");
        location.reload();
      }, 2000);
    }

  }

  function removeItem(e) {
    let elem = elementClosest(e.target, '.item');
    grid.hide(elem, {
      onFinish: function (items) {
        let item = items[0];
        grid.remove(item, {
          removeElements: true
        });
      }
    });
    updateIndices();
  }
  //
  // Generic helper functions
  //

  function generateSpecificElements(blocks) {
    let ret = [];
    for (let i = 0; i < blocks.length; i++) {
      let color;
      let width;

      if (blocks[i] != 0) {
        color = getRandomItem(filterOptions);
        width = blocks[i];
      } else {
        color = "transparent";
        width = 1;
      }

      let id = ++uuid;
      let title = "";
      let height = 1;
      let itemElem = document.createElement('div');
      let itemTemplate = '' +
        '<div class="item h' + height + ' w' + width + ' row' + currentRow + ' ' + color + '" data-id="' + id + '" data-color="' + color + '" data-title="' + title + '">' +
        '<div class="item-content">' +
        '<div class="card">' +
        '</div>' +
        '</div>' +
        '</div>';

      itemElem.innerHTML = itemTemplate;
      ret.push(itemElem.firstChild);

    }
    return ret;
  }

  function getRandomItem(collection) {
    return collection[Math.floor(Math.random() * collection.length)];
  }

  function updateIndices() {
    grid.getItems().forEach(function (item, i) {
      item.getElement().setAttribute('data-id', i + 1);
    });
  }

  function elementMatches(element, selector) {
    let p = Element.prototype;
    return (p.matches || p.matchesSelector || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector).call(element, selector);
  }

  function elementClosest(element, selector) {
    if (window.Element && !Element.prototype.closest) {
      let isMatch = elementMatches(element, selector);
      while (!isMatch && element && element !== document) {
        element = element.parentNode;
        isMatch = element && element !== document && elementMatches(element, selector);
      }
      return element && element !== document ? element : null;
    } else {
      return element.closest(selector);
    }
  }

  function getRandomInteger(min, max) {
    return Math.floor(Math.random() * ((max + 1) - min)) + min;
  }

  function generateARow() {
    currentRow++;

    let sum = 0;
    let sumWithZeroes = 0;
    let blocksPerRow = getRandomInteger(2, 5);
    let blockNumbers = new Array(columns).fill(0); // generate zero-blocks by columns
    for (let i = 0; i < blocksPerRow; i++) { // generate blocks
      let block = getRandomInteger(1, 4); // generate a block

      if ((sum + block) < columns) { // add if it fits
        let randomPos = getRandomInteger(0, columns);
        blockNumbers[randomPos] = block; // add to random position
        sum += blockNumbers[randomPos]; // append to sum to prevent overflow
      }
    }

    for (let i = 0; i < blockNumbers.length; i++) { // count the numbers including zeroes
      sumWithZeroes += blockNumbers[i];

      if (blockNumbers[i] == 0) { // if it is zero, append 1
        sumWithZeroes++;
      }
    }

    for (var i = blockNumbers.length - 1; i >= 0; i--) { // remove excessive zeroes - https://stackoverflow.com/a/5767335
      if (sumWithZeroes > columns && blockNumbers[i] === 0) {
        blockNumbers.splice(i, 1);
        sumWithZeroes--; // the variable loses its meaning after this but it is not needed afterwards anyway
      }
    }

    console.log("Blocks: " + blockNumbers + " Covering: " + sum + "/" + columns);
    let blockElements = generateSpecificElements(blockNumbers);
    console.log(blockElements);
    return blockElements;
  }

  function rowsToArray(){
    console.log("All rows:");
    console.log(grid.getItems());
  }

  function forceHttps() {
    // Ensures that the Greeny page is loaded over HTTPS - https://stackoverflow.com/a/4597085
    if (window.location.href.indexOf("greeny.cs.tlu.ee") != -1) {
      if (location.protocol == 'http:') {
        location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
      }
    }
  }

  //
  // Fire it up!
  //

  forceHttps();
  initDemo();

});