<?php

namespace WorkloadDashboard\Http;

use Illuminate\Http\Request;
use WorkloadDashboard\Http\Sources\Source;

/**
 * Class Dispatcher
 *
 * @package WorkloadDashboard\Http
 */
class Dispatcher
{
    /**
     * @param null|Request $request
     *
     * @return \WorkloadDashboard\Http\Sources\Trac
     */
    public function dispatch($request = null)
    {
        $request = $request ?: Request::capture();

        return Source::resolve($request->get('source'), $request);
    }
}