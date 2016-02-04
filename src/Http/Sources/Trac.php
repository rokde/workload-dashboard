<?php

namespace WorkloadDashboard\Http\Sources;

use Carbon\Carbon;
use WorkloadDashboard\Http\Sources\TracCsv\Reader;

/**
 * Class Trac
 *
 * @package WorkloadDashboard\Http\Sources
 */
class Trac extends Source
{
    /**
     * returns sources data
     *
     * @return mixed|array|\JsonSerializable
     */
    public function getData()
    {
        // request to url
        $url = $this->buildUrl($this->getUrl());
        $auth = $this->getAuth();

        // fetch response
        $response = $this->fetch($url, $auth);

        $reader = new Reader($response->getBody()->getContents());

        // parse/transfer response and set internal data
        return $reader->getEmployeeHours();
    }

    /**
     * @param string $reportUrl
     *
     * @return string
     */
    protected function buildUrl($reportUrl)
    {
        $currentQuery = parse_url($reportUrl, PHP_URL_QUERY);

        parse_str($currentQuery, $queryParams);

        $queryParams['STARTDATE'] = $this->getStartDate();
        $queryParams['ENDDATE'] = $this->getEndDate();
        $queryParams['format'] = 'csv';

        return str_replace($currentQuery, http_build_query($queryParams), $reportUrl);
    }

    /**
     * returns start date
     *
     * @return string
     */
    protected function getStartDate()
    {
        //  unix timestamp
        $startDate = $this->request->get('start');

        if (is_numeric($startDate)) {
            return $startDate . '000';
        }

        return Carbon::now()->startOfMonth()->timestamp . '000000';
    }

    /**
     * returns end date
     *
     * @return string
     */
    protected function getEndDate()
    {
        //  unix timestamp
        $endDate = $this->request->get('end');

        if (is_numeric($endDate)) {
            return $endDate . '000';
        }

        return '2000000000000000';
    }
}