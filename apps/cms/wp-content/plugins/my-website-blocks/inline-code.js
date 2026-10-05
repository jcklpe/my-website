/* global wp */
(function () {
  var el = wp.element.createElement;
  var useState = wp.element.useState;
  var richText = wp.richText;
  var languages = [
    { label: 'Enzo (default)', value: '' },
    { label: 'Plain text', value: 'text' },
    { label: 'JavaScript', value: 'javascript' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'HTML', value: 'html' },
    { label: 'CSS', value: 'css' },
    { label: 'PHP', value: 'php' },
    { label: 'Shell', value: 'shellscript' },
    { label: 'Python', value: 'python' },
    { label: 'JSON', value: 'json' },
    { label: 'Rust', value: 'rust' },
    { label: 'Java', value: 'java' },
    { label: 'F#', value: 'fsharp' },
    { label: 'Vue', value: 'vue' },
  ];

  function codeSelection(value) {
    if (value.start !== value.end) return value;
    function codeAt(index) {
      return (value.formats[index] || []).find(function (format) {
        return format.type === 'core/code';
      });
    }
    var start = value.start;
    if (!codeAt(start) && start > 0) start--;
    var current = codeAt(start);
    if (!current) return value;
    var language = (current.attributes && current.attributes.language) || '';
    function hasCode(index) {
      var format = codeAt(index);
      return (
        format &&
        ((format.attributes && format.attributes.language) || '') === language
      );
    }
    var end = start + 1;
    while (start > 0 && hasCode(start - 1)) start--;
    while (end < value.text.length && hasCode(end)) end++;
    return Object.assign({}, value, { start: start, end: end });
  }

  wp.domReady(function () {
    var original = wp.data.select('core/rich-text').getFormatType('core/code');
    if (!original) return;

    function InlineCodeEdit(props) {
      var selectionState = useState(null);
      var selection = selectionState[0];
      var setSelection = selectionState[1];
      var languageState = useState('');
      var language = languageState[0];
      var setLanguage = languageState[1];
      var active = richText.getActiveFormat(props.value, 'core/code');
      var open = function () {
        setSelection(codeSelection(props.value));
        setLanguage(
          (active && active.attributes && active.attributes.language) || '',
        );
      };
      var apply = function () {
        var attributes = language ? { language: language } : {};
        props.onChange(
          richText.applyFormat(selection, {
            type: 'core/code',
            attributes: attributes,
          }),
        );
        setSelection(null);
      };
      return el(
        wp.element.Fragment,
        null,
        el(original.edit, props),
        props.isActive &&
          el(wp.blockEditor.RichTextToolbarButton, {
            icon: 'translation',
            title: 'Inline code language',
            onClick: open,
          }),
        selection &&
          el(
            wp.components.Modal,
            {
              title: 'Inline code language',
              onRequestClose: function () {
                setSelection(null);
              },
            },
            el(wp.components.SelectControl, {
              label: 'Language',
              value: language,
              options: languages,
              help: 'Fragments are allowed. Enzo is used unless you choose another language or Plain text.',
              onChange: setLanguage,
            }),
            el(
              wp.components.Button,
              { variant: 'primary', onClick: apply },
              'Apply',
            ),
          ),
      );
    }

    // Extend the native format instead of nesting a second code format; its existing toggle and saved markup remain authoritative.
    richText.unregisterFormatType('core/code');
    richText.registerFormatType(
      'core/code',
      Object.assign({}, original, {
        attributes: Object.assign({}, original.attributes, {
          language: 'data-code-language',
        }),
        edit: InlineCodeEdit,
      }),
    );
  });
})();
