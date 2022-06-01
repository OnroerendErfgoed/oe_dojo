define([
  'dojo/_base/declare',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/Dialog',
  'dojo/text!./templates/ArcheologieportaalDialog.html',
  'dojo/dom-class'
], function (
  declare,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  Dialog,
  template,
  domClass
) {
  return declare([Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'archeologieportaal-dialog',
    title: 'Navigeer',
    archeologieportaalUrl: null,
    procesUrl: null,
    isBeheerder: null,

    postCreate: function () {
      this.inherited(arguments);
      this.archeologieportaalUrl = this.archeologieportaalUrl.replace(/\/?$/, '/');
      this.titleNode.innerHTML = '<i class="fa fa-th-large"></i> Navigeer ' +
        '<a href="'+ this.archeologieportaalUrl +'" target="_blank" class="archLink button tiny" ' +
        'style="margin-bottom: 0;">Naar Archeolgieportaal</a>';

      this.setUrls();
    },

    startup: function () {
      this.inherited(arguments);
    },

    hide: function () {
      this.inherited(arguments);
    },

    _okClick: function (evt) {
      console.debug('NavigateDialog::_okClick');
      evt.preventDefault();
      this.hide();
    },

    setUrls: function() {
      // VI vooronderzoek
      /* jshint -W106 */
      this.toelatingen_vo_vi.href = this.archeologieportaalUrl +
        'toelatingen_vooronderzoek/beheer';
      this.meldingen_aanvang_vo_vi.href = this.archeologieportaalUrl +
        'meldingen_aanvang/meldingen_aanvang_vooronderzoek_vi/beheer';
      this.arch_notas_vi.href = this.archeologieportaalUrl +
        'notas/beheer/archeologienotas';
      this.notas_vi.href = this.archeologieportaalUrl +
        'notas/beheer/notas';

      // VI opgraving
      this.meldingen_aanvang_opgr_vi.href = this.archeologieportaalUrl +
        'meldingen_aanvang/meldingen_aanvang_opgraving_vi/beheer';
      this.rapporten_opgr_vi.href = this.archeologieportaalUrl +
        'rapporten/beheer/#/archeologierapporten_vi';
      this.eindverslagen_vi.href = this.archeologieportaalUrl +
        'rapporten/beheer/#/eindverslagen_vi';

      // WV vooronderzoek
      this.toelatingen_vo_wv.href = this.archeologieportaalUrl +
        'toelatingen/beheer/#/toelatingen_vooronderzoek';
      this.meldingen_aanvang_vo_wv.href = this.archeologieportaalUrl +
        'meldingen_aanvang/meldingen_aanvang_vooronderzoek_wv/beheer';
      this.rapporten_vo_wv.href = this.archeologieportaalUrl +
        'rapporten/beheer/#/archeologierapporten_vooronderzoek_wv';
      this.eindverslagen_vo_wv.href = this.archeologieportaalUrl +
        'rapporten/beheer/#/eindverslagen_vooronderzoek_wv';

      // WV opgraving
      this.toelatingen_opgr_wv.href = this.archeologieportaalUrl +
        'toelatingen/beheer/#/toelatingen_opgraving';
      this.meldingen_aanvang_opgr_wv.href = this.archeologieportaalUrl +
        'meldingen_aanvang/meldingen_aanvang_opgraving_wv/beheer';
      this.rapporten_opgr_wv.href = this.archeologieportaalUrl +
        'rapporten/beheer/#/archeologierapporten_opgraving_wv';
      this.eindverslagen_opgr_wv.href = this.archeologieportaalUrl +
        'rapporten/beheer/#/eindverslagen_opgraving_wv';
      
      // Processen
      if (this.isBeheerder) {
        this.proces_archnotas.href = this.procesUrl +
          'archeologienotas';
        this.proces_notas.href = this.procesUrl +
          'notas';
        domClass.remove(this.procesapplicaties, 'hide');
      }
      /* jshint +W106 */
    }
  });
});
