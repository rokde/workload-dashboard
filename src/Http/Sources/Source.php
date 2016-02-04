<?php

namespace WorkloadDashboard\Http\Sources;

use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class Source
 *
 * @package WorkloadDashboard\Http\Sources
 */
abstract class Source
{
    /**
     * request
     *
     * @var \Illuminate\Http\Request
     */
    protected $request;

    /**
     * response status
     *
     * @var int
     */
    protected $status = 200;

    /**
     * response headers
     *
     * @var array
     */
    protected $headers = [];

    /**
     * http client
     *
     * @var ClientInterface
     */
    private $httpClient;

    /**
     * constructing Source
     *
     * @param Request $request
     * @param ClientInterface $httpClient
     */
    public function __construct($request, ClientInterface $httpClient = null)
    {
        $this->request = $request;
        $this->httpClient = $httpClient ?: new Client();
    }

    /**
     * returns url
     *
     * @return string
     */
    protected function getUrl()
    {
        return $this->request->get('url');
    }

    /**
     * returns start date for custom url
     *
     * @return string
     */
    abstract protected function getStartDate();

    /**
     * returns end date for custom url
     *
     * @return string
     */
    abstract protected function getEndDate();

    /**
     * returns auth settings
     *
     * @return array|null
     */
    protected function getAuth()
    {
        if ($this->request->has(['auth_type', 'auth_user', 'auth_pass'])) {
            return $this->request->only(['auth_type', 'auth_user', 'auth_pass']);
        }

        if ($this->request->has(['auth_type', 'auth_credentials'])) {

            $credentials = $this->request->get('auth_credentials');

            if (!empty($credentials)) {
                $credentials = base64_decode($credentials);
            }

            if (empty($credentials) || substr_count($credentials, ':') < 1) {
                return null;
            }

            list($user, $pass) = explode(':', $credentials);

            return [
                'auth_type' => $this->request->get('auth_type'),
                'auth_user' => $user,
                'auth_pass' => $pass
            ];
        }

        return null;
    }

    /**
     * fetches content
     *
     * @param string $url
     * @param array $auth
     * @param string $method
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    protected function fetch($url, $auth, $method = Request::METHOD_GET)
    {
        $options = [];

        if (!empty($auth)) {
            $options['auth'] = [
                array_get($auth, 'auth_user'),
                array_get($auth, 'auth_pass'),
            ];
        }

        if ($method === Request::METHOD_GET) {
            return $this->httpClient->get($url, $options);
        }

        return $this->httpClient->post($url, $options);
    }

    /**
     * resolves the correct source system
     *
     * only trac for the moment of writing
     *
     * @param string $sourceString
     * @param \Illuminate\Http\Request $request
     *
     * @return \WorkloadDashboard\Http\Sources\Trac
     */
    public static function resolve($sourceString, Request $request)
    {
        switch ($sourceString) {
            case 'trac':
            default:
                return new Trac($request);
        }
    }

    /**
     * returns status
     *
     * @return int
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * set status
     *
     * @param int $status
     *
     * @return Source
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * returns Headers
     *
     * @return array
     */
    public function getHeaders()
    {
        return $this->headers;
    }

    /**
     * set headers
     *
     * @param array $headers
     *
     * @return Source
     */
    public function setHeaders($headers)
    {
        $this->headers = $headers;

        return $this;
    }

    /**
     * returns sources data
     *
     * @return mixed|array|\JsonSerializable
     */
    abstract public function getData();

    /**
     * returns response
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getResponse()
    {
        return new JsonResponse($this->getData(), $this->getStatus(), $this->getHeaders());
    }
}