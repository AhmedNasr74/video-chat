@extends('layouts.app')
@section('content')
<script>
    window.contactList = JSON.parse('{!! $contactlist !!}')
</script>
<div id="contactlist"></div>
<div id="app">
</div>
@endsection
