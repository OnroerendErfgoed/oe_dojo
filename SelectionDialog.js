define([
  'dojo/_base/declare',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/Dialog',
  'dojo/_base/lang',
  'dojo/dom-construct',
  'dojo/on',
  'dgrid/OnDemandGrid',
  'dgrid/Selection',
  'dgrid/extensions/DijitRegistry',
  'dgrid/extensions/ColumnResizer',
  'dstore/Memory',
  'oe_dojo/DateUtils',
  'dojo/text!./templates/SelectionDialog.html'
], function (
  declare,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  Dialog,
  lang,
  domConstruct,
  on,
  OnDemandGrid,
  Selection,
  DijitRegistry,
  ColumnResizer,
  Memory,
  dateUtils,
  template
) {
  return declare([Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    parentNode: null,
    baseClass: 'selection-dialog',
    dataStore: null,
    myDataStore: null,
    selectedStore: null,
    selectedList: null,
    selectionMode: 'single', //default
    title: 'Voeg toe',
    typeName: 'data', //default
    _dataGrid: null,
    _selectedGrid: null,
    showMyItemsFilter: false,
    onlyMyItems: false,


    postCreate: function () {
      this.inherited(arguments);
    },

    startup: function () {
      this.inherited(arguments);

      this._dataGrid = this._createGrid({
        collection: this.dataStore,
        selectionMode: this.selectionMode,
        gridType: 'data'
      }, this.dataGridNode);
      this._dataGrid.startup();

      this.selectedStore = new Memory({ data: [] });
      this._selectedGrid = this._createGrid({
        collection: this.selectedStore,
        selectionMode: 'none',
        gridType: 'selected'
      }, this.selectedGridNode);
      this._selectedGrid.startup();

      if (this.typeName.includes('nota')) {
        this._dataGrid.styleColumn('datum_melden', 'display: table-cell;');
        this._dataGrid.styleColumn('datum_indienen', 'display: none;');
        this._selectedGrid.styleColumn('datum_melden', 'display: table-cell;');
        this._selectedGrid.styleColumn('datum_indienen', 'display: none;');
      } else if (this.typeName.includes('toelating')) {
        this._dataGrid.styleColumn('datum_melden', 'display: none;');
        this._dataGrid.styleColumn('datum_indienen', 'display: table-cell;');
        this._selectedGrid.styleColumn('datum_melden', 'display: none;');
        this._selectedGrid.styleColumn('datum_indienen', 'display: table-cell;');
      }


      if (this.showMyItemsFilter) {
        this.showMyItemsContainer.style.display = 'inline-block';
        on(this.showMyItemsNode, 'change', lang.hitch(this, function(evt) {
          if (evt.target.checked) {
            this.onlyMyItems = true;
            this._dataGrid.set('collection', this.myDataStore);
          } else {
            this.onlyMyItems = false;
            this._dataGrid.set('collection', this.dataStore);
          }
          this._dataGrid.resize();
        }));
      }
    },

    hide: function () {
      this._reset();
      this.inherited(arguments);
    },

    _filterData: function(evt) {
      evt ? evt.preventDefault() : null;
      var search = this.searchStringInput.value.trim();
      if (search) {
        if (!this.onlyMyItems) {
          this._dataGrid.set('collection', this.dataStore.filter({query: search}));
        } else {
          this._dataGrid.set('collection', this.myDataStore.filter({query: search}));
        }
        this._dataGrid.resize();
      }
    },

    _filterId: function(evt) {
      evt ? evt.preventDefault() : null;
      var search = this.searchIdInput.value;
      if (search) {
      if (!this.onlyMyItems) {
        this._dataGrid.set('collection', this.dataStore.filter({id: search}));
      } else {
        this._dataGrid.set('collection', this.myDataStore.filter({id: search}));
      }
        this._dataGrid.resize();
      }
    },

    /**
     * Bouwt het grid en de kolommen op.
     * @param {Object} options Options voor het grid
     * @param {Object} node De container voor het grid
     * @private
     */
    _createGrid: function (options, node) {
      console.debug('Menu::_createGrid');

      var columns = {
        id: 'iD',
        onderwerp:  'Onderwerp',
        'datum_melden': {
          label: 'Datum melden',
          formatter: lang.hitch(this, function (value) {
            return dateUtils.convertIsoStringToDate(value);
          })
        },
        'datum_indienen': {
          label: 'Datum indienen',
          formatter: lang.hitch(this, function (value) {
            return dateUtils.convertIsoStringToDate(value);
          })
        },
        archeoloog: 'Archeoloog',
        erkenningsnummer: 'Erkenningsnummer'
      };

      if (options.gridType === 'selected') {
        columns.remove = {
          label: '',
          sortable: false,
          resizable: false,
          renderCell: lang.hitch(this, function(object) {
            var div = domConstruct.create('div', { 'class': 'dGridHyperlink'});
            domConstruct.create('a', {
              href: '#',
              title: 'Verwijder' ,
              className: 'fa fa-trash',
              innerHTML: '',
              onclick: lang.hitch(this, function (evt) {
                evt.preventDefault();
                this._deleteItem(object);
              })
            }, div);
            return div;
          })
        };
      } else {
        columns.addItem = {
          label: '',
          sortable: false,
          resizable: false,
          renderCell: lang.hitch(this, function(object) {
            var div = domConstruct.create('div', { 'class': 'dGridHyperlink'});
            domConstruct.create('a', {
              href: '#',
              title: 'Voeg toe' ,
              className: 'fa fa-plus-circle',
              innerHTML: '',
              onclick: lang.hitch(this, function (evt) {
                evt.preventDefault();
                this._addItem(object);
              })
            }, div);
            return div;
          })
        };
      }

      var grid = new (declare([OnDemandGrid, Selection, DijitRegistry, ColumnResizer]))({
        selectionMode: 'single',
        columns: columns,
        collection: options.collection,
        sort:  [{
          property: 'id',
          descending: true
        }],
        noDataMessage: 'geen data beschikbaar',
        loadingMessage: 'data aan het ophalen...'
      }, node);

      grid.on('dgrid-error', lang.hitch(this, function(evt) {
        var error = evt.error;
        console.error('Menu::grid::error', error);
        //this._handleError(error);
      }));

      return grid;
    },

    _deleteItem: function(item) {
      if (item) {
        this.selectedStore.remove(item.id);
        this._selectedGrid.refresh();
      }
    },

    _addItem: function(item) {
      if (item) {
        if (this.selectionMode === 'single') {
          this.selectedStore = new Memory({ data: [] });
          this._selectedGrid.set('collection', this.selectedStore);
        }
        this.selectedStore.add(item);
        this._selectedGrid.refresh();
      }
    },

    _okClick: function (evt) {
      console.debug('SelectionDialog::_okClick');
      evt.preventDefault();
      if (this._validate()) {
        this.emit('selection.add', {
          data: this.selectedStore.data,
          node: this.parentNode
        });
        this.hide();
      }
    },

    _refreshGrid: function(evt) {
      evt ? evt.preventDefault() : null;
      this._reset();
    },

    _cancelClick: function (evt) {
      console.debug('SelectionDialog::_cancelClick');
      evt.preventDefault();
      this.hide();
    },

    _reset: function () {
      this.selectedStore = new Memory({ data: [] });
      this._selectedGrid.set('collection', this.selectedStore);
      if (!this.onlyMyItems) {
        this._dataGrid.set('collection', this.dataStore.filter({}));
      } else {
        this._dataGrid.set('collection', this.myDataStore.filter({}));
      }
    },

    _validate: function () {
      var valid = true;
      if (this.selectedStore.data.length <= 0) {
        valid = false;
      }
      return valid;
    }
  });
});
