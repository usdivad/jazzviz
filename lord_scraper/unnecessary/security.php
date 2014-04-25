<?php
	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');

	$data = $_POST['data'];
	$file = fopen('./timelog.txt', 'a');
	fwrite($file, $data.PHP_EOL);
	fclose($file);
	exit();
?>