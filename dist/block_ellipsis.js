(function (module, $) {
  'use strict';

  var DEFAULT = {
    lines: 1,
    min_blocks: 0,
    more: function (nb) {
      return ' <span class="more">Show ' + nb + ' more</span>';
    },
    less: ' <span class="less">Show less</span>',
    space_before_blocks: true,
    css: {
      visibility: 'visible',
      overflow: 'visible'
    }
  };

  /* Truncates a block
   * @param object options - Available options :
   *   - `lines` : Number of lines you want to display
   *   - `more`  : HTML to display more
   *   - `less`  : HTML to display less
   */
  var block_ellipsis = function (options) {
    if (typeof (options) === 'undefined') {
      options = {};
    }
    options = $.extend({}, DEFAULT, options);

    $(this).each(function () {
      var $root = $(this),
          $less = $(options.less),
          use_less = (typeof (options.less) !== 'undefined' && options.less !== null),
          $more;

      (function () {
        var $old_more = null,
            old_valign = null;

        var valign = function (align) {
          if (old_valign === null) {
            old_valign = $old_more.css('vertical-align');
          }
          if (!!align === true) {
            $old_more.css('vertical_align', 'top');
          } else {
            $old_more.css('vertical_align', old_valign);
          }
        };

        $more = function $more (nb, align) {
          if (typeof (valign) === 'undefined' || valign === null) {
            valign = true;
          }
          if (typeof (options.more) === 'undefined' || options.more === null) {
            if (!$old_more) {
              $old_more = $('<span style="display: inline-block; vertical-align: top; width: 0; height: 0; padding: 0; margin: 0; border: 0;"></span>');
            }
          }
          if (typeof (options.more) === 'string' || options.more instanceof String) {
            if (!$old_more) {
              $old_more = $(options.more);
              valign(align);
            }
          } else if (typeof (options.more) === 'function') {
            if (typeof (nb) === 'undefined') {
              if (!$old_more) {
                $old_more = $(options.more(nb));
              }
              valign(align);
            } else {
              var $new_more = $(options.more(nb));
              $old_more.replaceWith($new_more);
              $old_more = $new_more;
              valign(align);
            }
          }
          return $old_more;
        };
      }.call(this));
      var insertSpaceBefore = function insertSpaceBefore ($obj) {
        if (options.space_before_blocks === true) {
          $obj.before(' ');
        }
      };

      /*
       * If it doesn't, we check where would be the See More
       * (using `options.min`).
       * If it should be on the next line we will try to fill this line and
       * recheck if we still need a 'See more'.
       */

      /*
       * First let's check if we actually need a See More
       * For this we evaluate if the blocks would fit in `options.lines` lines.
       * Iterate on all the children. If the number of lines is over
       * `options.lines`, then we will need one.
       */
      var curr_line = 0,
          curr_nb_blocks = 0,
          last_position = -1,
          reached_min_line = Infinity,
          need_ellipsis = false,
          $min_block = null;
      $root.children().each(function () {
        if (need_ellipsis) {
          return;
        }
        var $child = $(this),
            position = $child.position();

        ++curr_nb_blocks;
        if (position.top !== last_position) {
          ++curr_line;
          last_position = position.top;
        }
        if (reached_min_line === Infinity  && curr_nb_blocks >= options.min_blocks) {
          reached_min_line = curr_line;
        }
        if (!$min_block && curr_line >= reached_min_line && curr_line >= options.lines) {
          $min_block = $child;
          $min_block.css('background', 'red');
        }
        if (curr_line > reached_min_line && curr_line > options.lines) {
          need_ellipsis = true;
        }
      });

      /* If we would need a Show More, let's check that if we added it,
       * we wouldn't be on a new line.
       * If we would, then check if it couldn't actually fit with this new line.
       */
      if (need_ellipsis) {
        var $children = $root.children(),
            $next, $nexts, more_pos;

        $more().insertAfter($min_block);
        insertSpaceBefore($more());
        more_pos = $more().position().top;
        $more().remove();

        if (more_pos !== $children.last().position().top) {
          var nb_nexts = $min_block.nextAll().length;

          $more(nb_nexts).insertAfter($min_block);
          insertSpaceBefore($more());

          while ($more().position().top === ($next = $more().next()).position().top) {
            $more(--nb_nexts).insertAfter($next);
            insertSpaceBefore($more());
          }

          $nexts = $more().nextAll();
          $nexts.addClass('block_ellipsis_other').hide();
          insertSpaceBefore($more());

          if ($nexts.length && typeof (options.more) !== 'undefined' && options.more !== null) {
            $more().on('click', function () {
              $root.find('.block_ellipsis_other').show();
              $more().hide();
              if (use_less) {
                $less.show();
              }
            });
            if (use_less) {
              $less.on('click', function () {
                $root.find('.block_ellipsis_other').hide();
                $less.hide();
                $more().show();
              });
              $less.appendTo($root).hide();
              insertSpaceBefore($less);
            }
          } else {
            $more().remove();
          }
        }
      }
    });
    for (var rule in options.css) {
      if (options.css.hasOwnProperty(rule)) {
        $(this).css(rule, options.css[rule]);
      }
    }
  };

  module.block_ellipsis = block_ellipsis;
  $.fn.block_ellipsis = block_ellipsis;
}(this, jQuery));
