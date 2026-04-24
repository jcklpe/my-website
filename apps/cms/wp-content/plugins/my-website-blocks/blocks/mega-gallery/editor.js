/* global wp */
(function () {
  var registerBlockType = wp.blocks.registerBlockType;
  var createBlock = wp.blocks.createBlock;
  var createElement = wp.element.createElement;
  var InnerBlocks = wp.blockEditor.InnerBlocks;
  var useBlockProps = wp.blockEditor.useBlockProps;
  var InspectorControls = wp.blockEditor.InspectorControls;
  var MediaUpload = wp.blockEditor.MediaUpload;
  var RangeControl = wp.components.RangeControl;
  var PanelBody = wp.components.PanelBody;
  var Button = wp.components.Button;
  var useSelect = wp.data.useSelect;

  registerBlockType('my-website/mega-gallery', {
    edit: function (props) {
      var attributes = props.attributes;
      var setAttributes = props.setAttributes;
      var columns = attributes.columns || 3;

      // Get the inner block client IDs to count items for the grid preview
      var clientId = props.clientId;
      var innerBlockCount = useSelect(
        function (select) {
          return select('core/block-editor').getBlockCount(clientId);
        },
        [clientId],
      );

      var blockProps = useBlockProps({
        style: {
          padding: '12px',
          background: 'rgba(0,0,0,0.04)',
          borderRadius: '4px',
        },
      });

      // Mini masonry-style grid preview using CSS columns
      var previewStyle = {
        columnCount: columns,
        columnGap: '8px',
        marginBottom: '8px',
      };

      var previewLabel = createElement(
        'p',
        {
          style: {
            margin: '0 0 8px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            opacity: 0.5,
          },
        },
        'Mega Gallery — ' + columns + ' column' + (columns !== 1 ? 's' : ''),
      );

      var addMediaButton = createElement(MediaUpload, {
        onSelect: function (medias) {
          var mediasArray = Array.isArray(medias) ? medias : [medias];
          var newBlocks = mediasArray.map(function (media) {
            if (media.type === 'video') {
              return createBlock('core/video', {
                src: media.url,
                id: media.id,
              });
            }
            return createBlock('core/image', {
              url: media.url,
              id: media.id,
              alt: media.alt || '',
              caption: media.caption || '',
            });
          });
          wp.data
            .dispatch('core/block-editor')
            .insertBlocks(newBlocks, undefined, clientId);
        },
        allowedTypes: ['image', 'video'],
        multiple: true,
        render: function (ref) {
          return createElement(
            Button,
            {
              onClick: ref.open,
              variant: 'secondary',
              style: { marginTop: '8px', display: 'block' },
            },
            innerBlockCount > 0 ? 'Add more media' : 'Add media',
          );
        },
      });

      return createElement(
        'div',
        blockProps,
        createElement(
          InspectorControls,
          null,
          createElement(
            PanelBody,
            { title: 'Layout', initialOpen: true },
            createElement(RangeControl, {
              label: 'Columns',
              value: columns,
              onChange: function (val) {
                setAttributes({ columns: val });
              },
              min: 1,
              max: 6,
            }),
          ),
        ),
        previewLabel,
        createElement(
          'div',
          { style: previewStyle },
          createElement(InnerBlocks, {
            allowedBlocks: ['core/image', 'core/video'],
            templateLock: false,
            renderAppender: false,
          }),
        ),
        addMediaButton,
      );
    },

    save: function () {
      // Dynamic block — PHP render callback owns the wrapper.
      // save() returns only InnerBlocks.Content so stored HTML is just
      // the serialised inner blocks, with no wrapper div to validate against.
      return createElement(InnerBlocks.Content);
    },
  });
})();
