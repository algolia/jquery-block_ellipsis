# jQuery block_ellipsis plugin

This plugin allows to display only a certain amount of lines of `inline-block`
elements. It then displays a `Show more` (customizable) button.

## Usage

Here are a description of the options with their default value.
```javascript
$('ul.tags').block_ellipsis({
  /**
   * Amount of lines you want to display
   */
  lines: 1,
  /**
   * Minimum amount of blocks you want to display (useful for responsive)
   */
  min_blocks: 0,
  /**
   * null|string|function
   * The HTML to display your 'Show more' clickable element.
   * You can either use a string, or a function that will take the number of
   * remaining blocks as a parameter
   */
  more: function (nb) {
    return '<span class="more">Show ' + nb + ' more</span>';
  },
  /**
   * Insert a space before 'Show more' and 'Show less' blocks.
   * This is useful because a space between `inline-block` elements
   * is displayed.
   * If your elements are floated, this won't change anything.
   */
  space_before_blocks: true,
  /**
   * null|string
   * The HTML to display your 'Show less' clickable element.
   * Can only be a string
   */
  less: '<span class="less">Show less</span>',
  /**
   * CSS rules to apply once the changes are done (avoids flickering)
   */
  css: {
    visibility: 'visible',
    overflow: 'visible'
  },
  /**
   * Enables debug features
   */
  debug: false
});
```

### Warnings

Because we use the top position of the elements to determine the line,
you can't use it on an element which isn't in the DOM, or that is in the
DOM but isn't displayed (`display: none`). First add it, then call
`block_ellipsis`.

Also, we force the use of `vertical-align: top` on the `more` option so
that we can detect if we're on the same line than other elements by
comparing their `$(...).position().top`.

### Flickering

To avoid flickering, we recommend you to add `visibility: hidden` to the
elements you want to call this plugin on, and then call it with
`{ css: { visibility: 'visible' } }`.
The execution time is low, but the problem is on page load, when `jQuery`
has to load before we can execute the script.
