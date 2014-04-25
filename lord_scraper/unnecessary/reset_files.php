<?php
	$cities_master = './cities_master.txt';
	$cities_slave = './cities_slave.txt';
	$timelog = './timelog.txt';
	$data = './data.csv';
	$data_template = './data_template.csv';

	copy($cities_master, $cities_slave);
	file_put_contents($timelog, '**Hard reset on '.date(DATE_RFC2822).PHP_EOL);
	copy($data_template, $data);

	echo 'files reset';
?>