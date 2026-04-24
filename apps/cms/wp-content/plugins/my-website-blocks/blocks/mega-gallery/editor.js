/* global wp */
(function () {
  var registerBlockType = wp.blocks.registerBlockType;
  var createElement = wp.element.createElement;
  var InnerBlocks = wp.blockEditor.InnerBlocks;
  var useBlockProps = wp.blockEditor.useBlockProps;

  registerBlockType('my-website/mega-gallery', {
    edit: function () {
      var blockProps = useBlockProps({
        style: {
          padding: '16px',
          background: 'rgba(0,0,0,0.05)',
          borderRadius: '4px',
          minHeight: '80px',
        },
      });

      return createElement(
        'div',
        blockProps,
        createElement(InnerBlocks, {
          allowedBlocks: ['core/image', 'core/video'],
          templateLock: false,
          renderAppender: InnerBlocks.DefaultBlockAppender,
        }),
      );
    },

    save: function () {
      return createElement(
        'div',
        useBlockProps.save(),
        createElement(InnerBlocks.Content),
      );
    },
  });
})();
