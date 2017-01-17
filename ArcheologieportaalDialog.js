define([
  'dojo/_base/declare',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/Dialog',
  'dojo/text!./templates/ArcheologieportaalDialog.html'
], function (
  declare,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  Dialog,
  template
) {
  return declare([Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'archeologieportaal-dialog',
    title: 'Navigeer',
    archeologieportaalUrl: null,

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
      this.meldingen_vo_vi.href = this.archeologieportaalUrl +
        'meldingen_vooronderzoek/beheer';
      this.meldingen_aanvang_vo_vi.href = this.archeologieportaalUrl +
        'meldingen_aanvang/meldingen_aanvang_vooronderzoek_vi/beheer';
      this.arch_notas_vi.href = this.archeologieportaalUrl +
        'notas/archeologienotas/beheer';
      this.notas_vi.href = this.archeologieportaalUrl +
        'notas/notas/beheer';

      // VI opgraving
      this.meldingen_aanvang_opgr_vi.href = this.archeologieportaalUrl +
        'meldingen_aanvang/meldingen_aanvang_opgraving_vi/beheer';
      this.rapporten_opgr_vi.href = this.archeologieportaalUrl +
        'rapporten/archeologierapporten/archeologierapporten_vi/beheer';
      this.eindverslagen_vi.href = this.archeologieportaalUrl +
        'rapporten/eindverslagen/eindverslagen_vi/beheer';

      // WV vooronderzoek
      this.toelatingen_vo_wv.href = this.archeologieportaalUrl +
        'toelatingen/toelatingen_vooronderzoek/beheer';
      this.meldingen_aanvang_vo_wv.href = this.archeologieportaalUrl +
        'meldingen_aanvang/meldingen_aanvang_vooronderzoek_wv/beheer';
      this.rapporten_vo_wv.href = this.archeologieportaalUrl +
        'rapporten/archeologierapporten/archeologierapporten_vooronderzoek_wv/beheer';
      this.eindverslagen_vo_wv.href = this.archeologieportaalUrl +
        'rapporten/eindverslagen/eindverslagen_vooronderzoek_wv/beheer';

      // WV opgraving
      this.toelatingen_opgr_wv.href = this.archeologieportaalUrl +
        'toelatingen/toelatingen_opgraving/beheer';
      this.meldingen_aanvang_opgr_wv.href = this.archeologieportaalUrl +
        'meldingen_aanvang/meldingen_aanvang_opgraving_wv/beheer';
      this.rapporten_opgr_wv.href = this.archeologieportaalUrl +
        'rapporten/archeologierapporten/archeologierapporten_opgraving_wv/beheer';
      this.eindverslagen_opgr_wv.href = this.archeologieportaalUrl +
        'rapporten/eindverslagen/eindverslagen_opgraving_wv/beheer';
      /* jshint +W106 */
    }
  });
});