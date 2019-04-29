/* jshint esversion: 6 */
document.addEventListener('DOMContentLoaded', function () {

  // Default options
  Muuri.defaultOptions.dragAxis = 'x';

  // Variables
  let grid = null;
  let docElem = document.documentElement;
  let demo = document.querySelector('.grid-demo');
  let gridElement = demo.querySelector('.grid');
  let addItemsElement = demo.querySelector('.add-more-items');
  let filterOptions = ['red', 'orange', 'yellow', 'blue', 'green', 'purple', 'white'];

  let uuid = 0;

  //
  // Grid helper functions
  //

  function initDemo() {

    initGrid();
    changeLayout();

    // Add/remove items bindings.
    addItemsElement.addEventListener('click', addItems);
    gridElement.addEventListener('click', function (e) {
      if (elementMatches(e.target, '.card-remove, .card-remove i')) {
        removeItem(e);
      }
    });

  }

  function initGrid() {

    let dragCounter = 0;

    grid = new Muuri(gridElement, {
        items: generateElements(20),
        layoutDuration: 400,
        layoutEasing: 'ease',
        dragEnabled: true,
        dragSortInterval: 50,
        dragContainer: document.body,
        dragStartPredicate: function (item, event) {
          let isRemoveAction = elementMatches(event.target, '.card-remove, .card-remove i');
          return true && !isRemoveAction ? Muuri.ItemDrag.defaultStartPredicate(item, event) : false;
        },
        dragReleaseDuration: 400,
        dragReleseEasing: 'ease'
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
      .on('move', updateIndices)
      .on('sort', updateIndices);

  }

  function addItems() {

    // Generate new elements.
    let newElems = generateElements(5);

    // Add the elements to the grid.
    let newItems = grid.add(newElems);

    // Update UI indices.
    updateIndices();
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

  function changeLayout() {
    grid._settings.layout = {
      horizontal: false,
      alignRight: false,
      alignBottom: true,
      fillGaps: true
    };
    grid.layout();

  }

  //
  // Generic helper functions
  //

  function generateElements(amount) {

    let ret = [];

    for (let i = 0, len = amount || 1; i < amount; i++) {

      let id = ++uuid;
      let color = getRandomItem(filterOptions);
      let title = "";
      let width;

      if (color == "white")
        width = 1;
      else
        width = Math.floor(Math.random() * 2) + 1;

      let height = 1;
      let itemElem = document.createElement('div');
      let itemTemplate = '' +
        '<div class="item h' + height + ' w' + width + ' ' + color + '" data-id="' + id + '" data-color="' + color + '" data-title="' + title + '">' +
        '<div class="item-content">' +
        '<div class="card">' +
        '<div class="card-id">' + id + '</div>' +
        '<div class="card-title">' + title + '</div>' +
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

  function compareItemTitle(a, b) {

    let aVal = a.getElement().getAttribute('data-title') || '';
    let bVal = b.getElement().getAttribute('data-title') || '';
    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;

  }

  function compareItemColor(a, b) {

    let aVal = a.getElement().getAttribute('data-color') || '';
    let bVal = b.getElement().getAttribute('data-color') || '';
    return aVal < bVal ? -1 : aVal > bVal ? 1 : compareItemTitle(a, b);

  }

  function updateIndices() {

    grid.getItems().forEach(function (item, i) {
      item.getElement().setAttribute('data-id', i + 1);
      item.getElement().querySelector('.card-id').innerHTML = i + 1;
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

  //
  // Fire it up!
  //

  initDemo();

});