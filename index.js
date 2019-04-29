/* jshint esversion: 6 */
document.addEventListener('DOMContentLoaded', function () {

  //
  // Initialize stuff
  //

  // Default options
  Muuri.defaultOptions.dragAxis = 'x';

  // Variables
  let grid = null;
  let docElem = document.documentElement;
  let demo = document.querySelector('.grid-demo');
  let gridElement = demo.querySelector('.grid');
  let filterField = demo.querySelector('.filter-field');
  let searchField = demo.querySelector('.search-field');
  let sortField = demo.querySelector('.sort-field');
  let layoutField = demo.querySelector('.layout-field');
  let addItemsElement = demo.querySelector('.add-more-items');
  let characters = 'abcdefghijklmnopqrstuvwxyz';
  let filterOptions = ['red', 'orange', 'yellow', 'blue', 'green', 'purple'];
  let dragOrder = [];
  let uuid = 0;
  let filterFieldValue;
  let sortFieldValue;
  let layoutFieldValue;
  let searchFieldValue;

  //
  // Grid helper functions
  //

  function initDemo() {

    initGrid();

    // Reset field values.
    searchField.value = '';
    [sortField, filterField, layoutField].forEach(function (field) {
      field.value = field.querySelectorAll('option')[0].value;
    });

    // Set inital search query, active filter, active sort value and active layout.
    searchFieldValue = searchField.value.toLowerCase();
    filterFieldValue = filterField.value;
    sortFieldValue = sortField.value;
    layoutFieldValue = layoutField.value;

    // Search field binding.
    searchField.addEventListener('keyup', function () {
      let newSearch = searchField.value.toLowerCase();
      if (searchFieldValue !== newSearch) {
        searchFieldValue = newSearch;
        filter();
      }
    });

    // Filter, sort and layout bindings.
    //filterField.addEventListener('change', filter);
    //sortField.addEventListener('change', sort);
    layoutField.addEventListener('change', changeLayout);

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
          let isDraggable = sortFieldValue === 'order';
          let isRemoveAction = elementMatches(event.target, '.card-remove, .card-remove i');
          return isDraggable && !isRemoveAction ? Muuri.ItemDrag.defaultStartPredicate(item, event) : false;
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

  function filter() {

    filterFieldValue = filterField.value;
    grid.filter(function (item) {
      let element = item.getElement();
      let isSearchMatch = !searchFieldValue ? true : (element.getAttribute('data-title') || '').toLowerCase().indexOf(searchFieldValue) > -1;
      let isFilterMatch = !filterFieldValue ? true : (element.getAttribute('data-color') || '') === filterFieldValue;
      return isSearchMatch && isFilterMatch;
    });

  }

  function sort() {

    // Do nothing if sort value did not change.
    let currentSort = sortField.value;
    if (sortFieldValue === currentSort) {
      return;
    }

    // If we are changing from "order" sorting to something else
    // let's store the drag order.
    if (sortFieldValue === 'order') {
      dragOrder = grid.getItems();
    }

    // Sort the items.
    grid.sort(
      currentSort === 'title' ? compareItemTitle :
      currentSort === 'color' ? compareItemColor :
      dragOrder
    );

    // Update indices and active sort value.
    updateIndices();
    sortFieldValue = currentSort;

  }

  function addItems() {

    // Generate new elements.
    let newElems = generateElements(5);

    // Set the display of the new elements to "none" so it will be hidden by
    // default.
    newElems.forEach(function (item) {
      item.style.display = 'none';
    });

    // Add the elements to the grid.
    let newItems = grid.add(newElems);

    // Update UI indices.
    updateIndices();

    // Sort the items only if the drag sorting is not active.
    if (sortFieldValue !== 'order') {
      grid.sort(sortFieldValue === 'title' ? compareItemTitle : compareItemColor);
      dragOrder = dragOrder.concat(newItems);
    }

    // Finally filter the items.
    filter();

  }

  function removeItem(e) {

    let elem = elementClosest(e.target, '.item');
    grid.hide(elem, {
      onFinish: function (items) {
        let item = items[0];
        grid.remove(item, {
          removeElements: true
        });
        if (sortFieldValue !== 'order') {
          let itemIndex = dragOrder.indexOf(item);
          if (itemIndex > -1) {
            dragOrder.splice(itemIndex, 1);
          }
        }
      }
    });
    updateIndices();

  }

  function changeLayout() {

    layoutFieldValue = layoutField.value;
    grid._settings.layout = {
      horizontal: false,
      alignRight: layoutFieldValue.indexOf('right') > -1,
      alignBottom: layoutFieldValue.indexOf('bottom') > -1,
      fillGaps: layoutFieldValue.indexOf('fillgaps') > -1
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
      let width = Math.floor(Math.random() * 2) + 1;
      let height = 1;
      let itemElem = document.createElement('div');
      let itemTemplate = '' +
        '<div class="item h' + height + ' w' + width + ' ' + color + '" data-id="' + id + '" data-color="' + color + '" data-title="' + title + '">' +
        '<div class="item-content">' +
        '<div class="card">' +
        '<div class="card-id">' + id + '</div>' +
        '<div class="card-title">' + title + '</div>' +
        '<div class="card-remove"><i class="material-icons">&#xE5CD;</i></div>' +
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

  function generateRandomWord(length) {

    let ret = '';
    for (let i = 0; i < length; i++) {
      ret += getRandomItem(characters);
    }
    return ret;

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