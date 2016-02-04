<?php

require_once '../vendor/autoload.php';

/**
 * This is a proxy for requesting different kind of ticket system apis, such as trac.
 *
 * Request params necessary:
 * - source: source system (trac, )
 * - url: report/api url
 * - auth.type: basic, ...
 * - auth.user: username
 * - auth.pass: password
 *
 * examples:
 * - http://localhost:8000/proxy.php?source=trac&auth.type=basic&auth.credentials=cm9iZXJ0Lmt1bW1lcjpyb2tfZGU=&url=https%3A%2F%2Fdfv.demobereich.de%2Ftrac%2Freport%2F11%3FBILLABLE%3D1%26UNBILLABLE%3D1%26CODEREVIEW%3DCodereview%26UMSETZUNG%3DUmsetzung%26ASSIGNED%3Dassigned%26KONZEPTION%3DKonzeption%26CLOSED%3Dclosed%26TEST%3DTest%26NEW%3Dnew%26ONHOLD%3DOnhold%26STARTDATE%3D1451602800000000%26ENDDATE%3D2000000000000000
 * - http://localhost:8000/proxy.php?source=trac&auth.type=basic&auth.user=robert.kummer&auth.pass=rok_de&url=https%3A%2F%2Fdfv.demobereich.de%2Ftrac%2Freport%2F11%3FBILLABLE%3D1%26UNBILLABLE%3D1%26CODEREVIEW%3DCodereview%26UMSETZUNG%3DUmsetzung%26ASSIGNED%3Dassigned%26KONZEPTION%3DKonzeption%26CLOSED%3Dclosed%26TEST%3DTest%26NEW%3Dnew%26ONHOLD%3DOnhold%26STARTDATE%3D1451602800000000%26ENDDATE%3D2000000000000000
 * - http://localhost:8000/proxy.php?source=trac&auth.type=basic&auth.user=robert.kummer&auth.pass=rok_de&url=https%3A%2F%2Fizjobs.demobereich.de%2Ftrac%2Freport%2F11%3FBILLABLE%3D1%26UNBILLABLE%3D1%26ASSIGNED%3Dassigned%26ACCEPTED%3Daccepted%26CLOSED%3Dclosed%26NEW%3Dnew%26REOPENED%3Dreopened%26STARTDATE%3D1451602800000000%26ENDDATE%3D2000000000000000
 * - http://localhost:8000/proxy.php?source=trac&auth.type=basic&auth.user=robert.kummer&auth.pass=rok_de&url=https%3A%2F%2Fipunkt-intern.demobereich.de%2Ftrac%2Freport%2F11%3FBILLABLE%3D1%26UNBILLABLE%3D1%26ASSIGNED%3Dassigned%26ACCEPTED%3Daccepted%26CLOSED%3Dclosed%26NEW%3Dnew%26REOPENED%3Dreopened%26STARTDATE%3D0%26ENDDATE%3D2000000000000000
 */

$dispatcher = new \WorkloadDashboard\Http\Dispatcher();

$source = $dispatcher->dispatch();

$source->getResponse()->send();
