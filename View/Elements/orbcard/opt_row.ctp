<?php
	$list_classes = ["orb-opt", "xtreme-select-list"];
if ($opt):
	array_push($list_classes, $opt['default'] ? 'active default' : 'inactive');
	$icons = ['right-side' => "R", 'full' => "F", 'left-side' => "L", 'double' => "D"];
	$data = ["route" => sprintf("toggle_opt/%s", $opt['id']), 'optflags' => [], 'id' => $opt['id'], 'title' => $opt['title']];
	$flag_icon = null;
	if ( array_key_exists("Optflag", $opt) ):
		foreach ($opt['Optflag'] as $flag):
			if ( $flag[ 'title' ] ):
				if (!$flag_icon) {
					$flag_icon = $flag['title'];
				} else {
					$flag_icon = $flag_icon == "premium" ? $flag["title"]."-".$flag_icon : $flag_icon."-".$flag["title"];
				}
				array_push( $list_classes, $flag[ 'title' ] );
				array_push( $data[ 'optflags' ], $flag[ 'id' ] );
			endif;
		endforeach;
	endif;

	?>
	<?=sprintf("<li id='orb-opt-%s' %s %s>", $opt['id'], ___cD($list_classes), ___dA($data)); ?>
	<?=$flag_icon != null ? "<span class='flag-icon icon-f-$flag_icon'></span>" : null;?>
	<?='<ul class="stretch inline">';?>
	<?php foreach ($icons as $icon => $value):
				$classes = array("orb-opt-coverage", $icon, "icon-$icon", "inactive", "disabled");
//				if ($icon == "full") $classes[3] = "active";
				if ($opt['default']) $classes[4] = "enabled";
				echo sprintf("<li %s data-route='coverage_toggle/%s/$value'></li>", ___cD($classes), $opt['id']);
			endforeach;?>
	<?=sprintf('<li><a href="#">%s</a></li>', strtoupper($opt['title']));?>
	<?='</ul>';?>
	<?='</li>';?>
<?php else:
	echo sprintf('<li %s></li>', ___cD($list_classes));
endif;