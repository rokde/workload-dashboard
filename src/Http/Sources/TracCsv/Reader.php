<?php

namespace WorkloadDashboard\Http\Sources\TracCsv;

/**
 * Class Reader
 *
 * @package WorkloadDashboard\Http\Sources\TracCsv
 */
class Reader
{
    /**
     * constructing Reader
     *
     * @param string $csvContent
     */
    public function __construct($csvContent, $lineBreak = "\r\n")
    {
        $csvContent = $this->remove_utf8_bom($csvContent);

        list($headline, $contentRows) = explode($lineBreak, $csvContent, 2);

        $this->csvLabels = str_getcsv($headline);
        $this->csv = array_map([$this, 'parseRow'], explode($lineBreak, $contentRows));
    }

    /**
     * @param string $contentRow
     *
     * @return array
     */
    protected function parseRow($contentRow)
    {
        if (empty($contentRow)) {
            return [];
        }

        return array_combine($this->csvLabels, str_getcsv($contentRow));
    }

    /**
     * returns hours for an employee
     *
     * @return array
     */
    public function getEmployeeHours()
    {
        $result = [];

        foreach ($this->csv as $row) {
            if (array_has($row, 'ticket') && array_get($row, 'ticket') === '0') {
                $result[ array_get($row, '__group__') ] = array_get($row, 'Work_added', 0) + 0.0;
            }
        }

        return $result;
    }

    /**
     * removes utf8 bom
     *
     * @param string $text
     *
     * @return string
     */
    private function remove_utf8_bom($text)
    {
        $bom = pack('H*', 'EFBBBF');
        $text = preg_replace("/^$bom/", '', $text);

        return $text;
    }
}