document.addEventListener('DOMContentLoaded', function () {

  //
  // Initialize stuff
  //

  var grid = null;
  var docElem = document.documentElement;
  var demo = document.querySelector('.grid-demo');
  var gridElement = demo.querySelector('.grid');
  var dragOrder = [];
  var uuid = 0;

  //
  // Grid helper functions
  //

  function initDemo() {
    initGrid();
  }

  function initGrid() {

    var dragCounter = 0;

    grid = new Muuri(gridElement, {
      items: '.item',
      layout: {
        fillGaps: true,
        horizontal: false,
        alignRight: false,
        alignBottom: false,
        rounding: true
      },
      layoutDuration: 400,
      layoutEasing: 'ease',
      dragEnabled: true,
      dragSortInterval: 50,
      dragContainer: document.body,
      dragStartPredicate: function (item, event) {
        return Muuri.ItemDrag.defaultStartPredicate(item, event);
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
    .on('move', updateIndices);
  }


  function updateIndices() {
    grid.getItems().forEach(function (item, i) {
      item.getElement().setAttribute('data-id', i + 1);
    });

  }

  initDemo();

});
