<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User;
use \Pusher\Pusher;
class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        $contactlist = (User::where('id' , '!=' , auth()->user()->id)->get());
// dd($contactlist);
        return view('home' , ['contactlist' => json_encode($contactlist)]);
    }
    public function contactList()
    {
        $contactlist = User::where('id' , '!=' , auth()->user()->id)->get();
        $data = [
            'status' > 'ok',
            'contactList' => $contactlist
        ];
        return response()->json($data, 200);
    }
    public function authenticate(Request $request)
    {
        $socketId = $request->socket_id;
        $channel_name = $request->channel_name;
        $pusher = new Pusher('babc9ca7061ad55972b2' , '6b712665bb48d2e48995' , '896879' ,[
            'cluster' => "mt1",
            'encrypted' => true,
        ] );
        $presence_data = ['name' => auth()->user()->name];
        $key= $pusher->presence_auth($channel_name ,$socketId , auth()->user()->id, $presence_data );
        return response($key);
    }
}
