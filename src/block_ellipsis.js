(function ($) {
  'use strict';
  var _ = {
    debounce: require('lodash/function/debounce'),
    isFunction: require('lodash/lang/isFunction'),
    isNaN: require('lodash/lang/isNaN'),
    isNull: require('lodash/lang/isNull'),
    isString: require('lodash/lang/isString'),
    isUndefined: require('lodash/lang/isUndefined')
  };

  var $all = [];

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
    },
    debug: false
  };

  var topPosition = function topPosition ($obj) {
    var border_top = parseInt($obj.css('border-top'), 10),
        valign = $obj.css('vertical-align'),
        res;
    $obj.css('vertical-align', 'top');
    if (_.isNaN(border_top)) {
      border_top = 0;
    }
    res = $obj.position().top - border_top;
    $obj.css('vertical-align', valign);

    return res;
  };

  /* Truncates a block
   * @param object options - Available options :
   *   - `lines` : Number of lines you want to display
   *   - `more`  : HTML to display more
   *   - `less`  : HTML to display less
   */
  var block_ellipsis = function (options) {
    if (_.isUndefined(options)) {
      options = {};
    }
    options = $.extend({}, DEFAULT, options);

    var insertSpaceBefore = function insertSpaceBefore ($obj) {
      if (options.space_before_blocks === true) {
        $obj.before(' ');
      }
    };

    $(this).each(function () {
      var $root = $(this),
          $less = $(options.less),
          use_less = (!_.isUndefined(options.less) && !_.isNull(options.less)),
          $more;

      (function () {
        var $old_more = null;

        $more = function $more (nb) {
          if (_.isUndefined(options.more) || _.isNull(options.more)) {
            if (!$old_more) {
              $old_more = $('<span style="display: inline-block; vertical-align: top; width: 0; height: 0; padding: 0; margin: 0; border: 0;"></span>');
            }
          }
          if (_.isString(options.more)) {
            if (!$old_more) {
              $old_more = $(options.more);
            }
          } else if (_.isFunction(options.more)) {
            if (_.isUndefined(nb)) {
              if (!$old_more) {
                $old_more = $(options.more(nb));
              }
            } else {
              var $new_more = $(options.more(nb));
              $old_more.replaceWith($new_more);
              $old_more = $new_more;
            }
          }
          return $old_more;
        };
      }.call(this));

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
            top_position = topPosition($child);

        ++curr_nb_blocks;
        if (top_position !== last_position) {
          ++curr_line;
          last_position = top_position;
        }
        if (reached_min_line === Infinity  && curr_nb_blocks >= options.min_blocks) {
          reached_min_line = curr_line;
        }
        if (!$min_block && curr_line >= reached_min_line && curr_line >= options.lines) {
          $min_block = $child;
          if (options.debug) {
            $min_block.css('background', 'red');
          }
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
        more_pos = topPosition($more());
        $more().remove();

        if (more_pos !== topPosition($children.last())) {
          var nb_nexts = $min_block.nextAll().length;

          $more(nb_nexts).insertAfter($min_block);
          insertSpaceBefore($more());
          $next = $more();
          while (topPosition($more()) === topPosition($next = $more().next())) {
            $more().remove();
            $more(--nb_nexts).insertAfter($next);
            insertSpaceBefore($more());
          }

          $nexts = $more().nextAll();
          $nexts.addClass('block_ellipsis_other').hide();

          insertSpaceBefore($more());

          if ($nexts.length && !_.isUndefined(options.more) && !_.isNull(options.more)) {
            $more().on('click', function (e) {
              e.preventDefault ? e.preventDefault() : event.returnValue = false;
              $root.find('.block_ellipsis_other').show();
              $more().hide();
              if (use_less) {
                $less.show();
              }
            });
            if (use_less) {
              $less.on('click', function (e) {
                e.preventDefault ? e.preventDefault() : event.returnValue = false;
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

      $all.push({ root: $root, more: $more(), less: $less, options: options });
    });
    for (var rule in options.css) {
      if (options.css.hasOwnProperty(rule)) {
        $(this).css(rule, options.css[rule]);
      }
    }
  };

  $.fn.block_ellipsis = module.exports = block_ellipsis;

  $(window).on('resize', _.debounce(function () {
    var len = $all.length;
    for (var i = 0; i < len; ++i) {
      var elt = $all[i];
      elt.more.remove();
      elt.less.remove();
      elt.root.find('.block_ellipsis_other').removeClass('block_ellipsis_other').show();
      elt.root.block_ellipsis(elt.options, true);
    }
    $all.splice(0, len);
  }, 250));
}.call(this, jQuery));
