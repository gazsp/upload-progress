<?php

if(isset($_FILES) && count($_FILES)) {
	$data = $_FILES;
}
else {
	$data = array(
		'error' => 'No files uploaded'
	);
}

header('Content-Type: application/json');
echo json_encode($data);